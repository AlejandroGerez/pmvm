import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Precios en ARS — montos bajos para pruebas en prod; subirlos cuando cierres el testeo.
const PLANS: Record<string, { name: string; price: number; days: number }> = {
  monthly:    { name: 'Plan Mensual R3SET',   price: 100, days: 30  },
  quarterly:  { name: 'Plan Trimestral R3SET', price: 150, days: 90  },
  semiannual: { name: 'Plan Semestral R3SET',  price: 200, days: 180 },
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { planId, locale } = await req.json()
    const plan = PLANS[planId]
    if (!plan) return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const mpAccessToken = process.env.MP_ACCESS_TOKEN

    if (!mpAccessToken) {
      return NextResponse.json({ error: 'MP_ACCESS_TOKEN no configurado' }, { status: 500 })
    }

    // Crear registro de suscripción pendiente en Supabase
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        status: 'pending',
        locale: locale ?? 'es',
      })
      .select()
      .single()

    if (subError) throw subError

    // Crear preferencia en Mercado Pago
    const preference = {
      items: [
        {
          id: planId,
          title: plan.name,
          description: `Acceso R3SET por ${plan.days} días`,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: plan.price,
        },
      ],
      payer: {
        email: user.email,
      },
      back_urls: {
        success: `${siteUrl}/${locale ?? 'es'}/checkout/success?sub=${subscription.id}`,
        failure: `${siteUrl}/${locale ?? 'es'}/checkout/failure?sub=${subscription.id}`,
        pending: `${siteUrl}/${locale ?? 'es'}/checkout/success?sub=${subscription.id}&status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${siteUrl}/api/mp/webhook`,
      external_reference: subscription.id,
      metadata: {
        subscription_id: subscription.id,
        user_id: user.id,
        plan_id: planId,
        user_email: user.email,
      },
    }

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify(preference),
    })

    if (!mpRes.ok) {
      const err = await mpRes.text()
      console.error('MP error:', err)
      return NextResponse.json({ error: 'Error al crear preferencia en Mercado Pago' }, { status: 500 })
    }

    const mpData = await mpRes.json()

    // Guardar preference_id en la suscripción
    await supabase
      .from('subscriptions')
      .update({ mp_preference_id: mpData.id })
      .eq('id', subscription.id)

    return NextResponse.json({
      preferenceId: mpData.id,
      initPoint: mpData.init_point,          // producción
      sandboxInitPoint: mpData.sandbox_init_point, // testing
    })
  } catch (error) {
    console.error('create-preference error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
