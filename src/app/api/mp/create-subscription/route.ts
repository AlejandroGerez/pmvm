import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * Planes con frecuencia para suscripción recurrente de MP.
 * Los precios son de prueba — ajustar en producción.
 */
const PLANS: Record<string, {
  name: string
  price: number
  days: number
  frequency: number
  frequencyType: 'months' | 'days'
}> = {
  monthly:    { name: 'Plan Mensual R3SET',    price: 100,  days: 30,  frequency: 1, frequencyType: 'months' },
  quarterly:  { name: 'Plan Trimestral R3SET',  price: 150,  days: 90,  frequency: 3, frequencyType: 'months' },
  semiannual: { name: 'Plan Semestral R3SET',   price: 200,  days: 180, frequency: 6, frequencyType: 'months' },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { planId, locale = 'es', email, fullName, phone, password } = body

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
      // Already logged in — use their ID
      userId = existingUser.id
      userEmail = existingUser.email!
    } else if (email && password) {
      // New user — register them via admin API (bypasses email confirmation)
      const adminClient = createAdminSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!
      )

      // First check if user already exists
      const { data: existingProfile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existingProfile) {
        return NextResponse.json({
          error: 'Ya existe una cuenta con ese email. Iniciá sesión primero.',
          code: 'USER_EXISTS',
        }, { status: 409 })
      }

      // Create user (email_confirm: true so they can sign in immediately)
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName ?? '' },
      })

      if (createError || !newUser.user) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 })
      }

      userId = newUser.user.id
      userEmail = email
      isNewUser = true

      // Update profile with extra fields
      await adminClient
        .from('profiles')
        .update({
          full_name: fullName?.trim() || null,
          phone: phone?.trim() || null,
          onboarding_completed: true, // skip onboarding since they're coming from checkout
          locale,
        })
        .eq('id', userId)
    } else {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    // ── Create pending subscription in Supabase ──
    const adminClient = createAdminSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: subscription, error: subError } = await adminClient
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'pending',
        recurring: true,
        locale,
      })
      .select()
      .single()

    if (subError) throw subError

    // ── Create MP preapproval (recurring subscription) ──
    const preapprovalBody = {
      reason: plan.name,
      auto_recurring: {
        frequency: plan.frequency,
        frequency_type: plan.frequencyType,
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

    // Store MP preapproval ID
    await adminClient
      .from('subscriptions')
      .update({ mp_preapproval_id: mpData.id })
      .eq('id', subscription.id)

    return NextResponse.json({
      initPoint: mpData.init_point,
      sandboxInitPoint: mpData.sandbox_init_point,
      subscriptionId: subscription.id,
      isNewUser,
    })
  } catch (error) {
    console.error('create-subscription error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
