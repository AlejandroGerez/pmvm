import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Planes disponibles.
 * - isRecurring: false → cobro único (usa MP Preferences API)
 * - isRecurring: true  → suscripción mes a mes (usa MP Preapproval API)
 */
const PLANS: Record<string, {
  name: string
  price: number
  days: number
  isRecurring: boolean
  frequency?: number
  frequencyType?: 'months' | 'days'
}> = {
  // Todos los planes son suscripciones recurrentes automáticas (Preapproval API de MP).
  // Plan B si MP Argentina no soporta frequency: 3 o 6 → cambiar a frequency: 1 y ajustar price al equivalente mensual.
  monthly:    { name: 'Plan Mensual R3SET',    price: 44999,  days: 30,  isRecurring: true, frequency: 1, frequencyType: 'months' },
  quarterly:  { name: 'Plan Trimestral R3SET',  price: 119999, days: 90,  isRecurring: true, frequency: 3, frequencyType: 'months' },
  semiannual: { name: 'Plan Semestral R3SET',   price: 219999, days: 180, isRecurring: true, frequency: 6, frequencyType: 'months' },
  // Mentoría 1-1: sin cobro web. El flujo es solo por /evaluacion (formulario → coach).
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { planId, locale = 'es', email, fullName, phone, password, skipAccount } = body

    const plan = PLANS[planId]
    if (!plan) return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })

    const mpAccessToken = process.env.MP_ACCESS_TOKEN
    if (!mpAccessToken) return NextResponse.json({ error: 'MP no configurado' }, { status: 500 })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const supabase = createClient()
    let userId: string
    let userEmail: string
    let isNewUser = false

    // ── Check if user is already authenticated ──
    const { data: { user: existingUser } } = await supabase.auth.getUser()

    if (existingUser) {
      userId = existingUser.id
      userEmail = existingUser.email!
    } else if (email && (password || skipAccount)) {
      // New user — register via admin API (bypasses email confirmation)
      const adminClient = createAdminClient()
      // When skipAccount=true, generate a random password (user sets it later via mobile app)
      const effectivePassword = skipAccount
        ? Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
        : password

      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password: effectivePassword,
        email_confirm: true,
        user_metadata: { full_name: fullName ?? '' },
      })

      if (createError) {
        console.error('Error creating user:', createError.message)
        const isAlreadyRegistered =
          createError.message.toLowerCase().includes('already been registered') ||
          createError.message.toLowerCase().includes('already registered') ||
          createError.message.toLowerCase().includes('email already') ||
          createError.status === 422

        if (isAlreadyRegistered) {
          // Email ya existe — buscar usuario eficientemente por email y reutilizarlo
          // SEGURIDAD: no se cambia contraseña, no se crea sesión, no se devuelven credenciales
          try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
            const serviceKey  = process.env.SUPABASE_SECRET_KEY!
            const filterRes   = await fetch(
              `${supabaseUrl}/auth/v1/admin/users?filter=${encodeURIComponent(email)}&per_page=10`,
              { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } }
            )
            if (!filterRes.ok) {
              console.error('GoTrue filter error:', filterRes.status, await filterRes.text())
              return NextResponse.json({ error: 'No se pudo verificar la cuenta existente.' }, { status: 500 })
            }
            const filterData  = await filterRes.json()
            const found       = (filterData?.users ?? []).find(
              (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase()
            )
            if (!found) {
              return NextResponse.json({ error: 'No se pudo recuperar la cuenta existente.' }, { status: 500 })
            }
            userId    = found.id
            userEmail = email
            isNewUser = false
          } catch (lookupErr) {
            console.error('Error al buscar cuenta existente:', lookupErr)
            return NextResponse.json({ error: 'No se pudo verificar la cuenta existente.' }, { status: 500 })
          }
        } else {
          return NextResponse.json({ error: `Error al crear la cuenta: ${createError.message}` }, { status: 500 })
        }
      } else {
        if (!newUser.user) {
          return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 })
        }
        userId = newUser.user.id
        userEmail = email
        isNewUser = true
      }

      // Update profile — only use columns that definitely exist
      await adminClient
        .from('profiles')
        .update({
          full_name: fullName?.trim() || null,
          phone: phone?.trim() || null,
          onboarding_completed: true,
        })
        .eq('id', userId)
    } else {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    // ── Create pending subscription ──
    const adminClient = createAdminClient()

    // Only include columns that exist in the current schema
    // Run supabase/add-recurring-subscriptions.sql to unlock locale + mp_preapproval_id
    const insertPayload: Record<string, unknown> = {
      user_id: userId,
      plan_id: planId,
      status: 'pending',
    }

    const { data: subscription, error: subError } = await adminClient
      .from('subscriptions')
      .insert(insertPayload)
      .select()
      .single()

    if (subError) {
      console.error('Error creating subscription:', subError)
      throw subError
    }

    // ── Route to correct MP API based on plan type ──
    if (plan.isRecurring) {
      return await createRecurringPreapproval({ plan, planId, subscription, userEmail, siteUrl, locale, adminClient, mpAccessToken, isNewUser })
    } else {
      return await createOneTimePreference({ plan, planId, subscription, userEmail, siteUrl, locale, mpAccessToken, isNewUser })
    }

  } catch (error) {
    console.error('create-subscription error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ── One-time payment via MP Preferences ──────────────────────────────────────
async function createOneTimePreference({
  plan, planId, subscription, userEmail, siteUrl, locale, mpAccessToken, isNewUser,
}: {
  plan: typeof PLANS[string]
  planId: string
  subscription: { id: string }
  userEmail: string
  siteUrl: string
  locale: string
  mpAccessToken: string
  isNewUser: boolean
}) {
  const preferenceBody = {
    items: [{
      title: plan.name,
      quantity: 1,
      unit_price: plan.price,
      currency_id: 'ARS',
    }],
    payer: { email: userEmail },
    back_urls: {
      success: `${siteUrl}/${locale}/checkout/success?sub=${subscription.id}`,
      failure: `${siteUrl}/${locale}/checkout/failure`,
      pending: `${siteUrl}/${locale}/checkout/success?sub=${subscription.id}&pending=1`,
    },
    auto_return: 'approved',
    external_reference: subscription.id,
    statement_descriptor: 'R3SET',
  }

  const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${mpAccessToken}`,
    },
    body: JSON.stringify(preferenceBody),
  })

  if (!mpRes.ok) {
    const errText = await mpRes.text()
    console.error('MP preference error:', errText)
    return NextResponse.json({ error: 'Error al crear preferencia de pago' }, { status: 500 })
  }

  const mpData = await mpRes.json()

  return NextResponse.json({
    initPoint: mpData.init_point,
    sandboxInitPoint: mpData.sandbox_init_point,
    subscriptionId: subscription.id,
    isNewUser,
    type: 'one_time',
  })
}

// ── Recurring subscription via MP Preapproval ─────────────────────────────────
async function createRecurringPreapproval({
  plan, planId, subscription, userEmail, siteUrl, locale, adminClient, mpAccessToken, isNewUser,
}: {
  plan: typeof PLANS[string]
  planId: string
  subscription: { id: string }
  userEmail: string
  siteUrl: string
  locale: string
  adminClient: ReturnType<typeof createAdminClient>
  mpAccessToken: string
  isNewUser: boolean
}) {
  const preapprovalBody = {
    reason: plan.name,
    auto_recurring: {
      frequency: plan.frequency ?? 1,
      frequency_type: plan.frequencyType ?? 'months',
      transaction_amount: plan.price,
      currency_id: 'ARS',
    },
    back_url: `${siteUrl}/${locale}/checkout/success?sub=${subscription.id}`,
    payer_email: userEmail,
    external_reference: subscription.id,
  }

  const mpRes = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${mpAccessToken}`,
    },
    body: JSON.stringify(preapprovalBody),
  })

  if (!mpRes.ok) {
    const errText = await mpRes.text()
    console.error('─── MP preapproval error ───────────────────────')
    console.error('HTTP status:', mpRes.status, mpRes.statusText)
    console.error('Body enviado a MP:', JSON.stringify(preapprovalBody, null, 2))
    try { console.error('Respuesta de MP:', JSON.parse(errText)) } catch { console.error('Respuesta de MP (raw):', errText) }
    console.error('────────────────────────────────────────────────')
    return NextResponse.json({ error: 'Error al crear suscripción en Mercado Pago' }, { status: 500 })
  }

  const mpData = await mpRes.json()

  // Store preapproval ID if column exists (requires migration)
  try {
    await adminClient
      .from('subscriptions')
      .update({ mp_preapproval_id: mpData.id })
      .eq('id', subscription.id)
  } catch {
    console.warn('mp_preapproval_id column not found — run add-recurring-subscriptions.sql migration')
  }

  return NextResponse.json({
    initPoint: mpData.init_point,
    sandboxInitPoint: mpData.sandbox_init_point,
    subscriptionId: subscription.id,
    isNewUser,
    type: 'recurring',
  })
}
