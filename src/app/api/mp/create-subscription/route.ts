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
  monthly:    { name: 'Plan Mensual R3SET',    price: 100,  days: 30,  isRecurring: false },
  quarterly:  { name: 'Plan Trimestral R3SET',  price: 150,  days: 90,  isRecurring: false },
  semiannual: { name: 'Plan Semestral R3SET',   price: 200,  days: 180, isRecurring: false },
  mentoria:   { name: 'Mentoría 1-1 R3SET',     price: 300,  days: 30,  isRecurring: true, frequency: 1, frequencyType: 'months' },
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
          return NextResponse.json({
            error: 'Ya existe una cuenta con ese email. Iniciá sesión primero.',
            code: 'USER_EXISTS',
          }, { status: 409 })
        }
        return NextResponse.json({ error: `Error al crear la cuenta: ${createError.message}` }, { status: 500 })
      }

      if (!newUser.user) {
        return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 })
      }

      userId = newUser.user.id
      userEmail = email
      isNewUser = true

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
    console.error('MP preapproval error:', errText)
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
