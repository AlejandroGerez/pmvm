import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const PLAN_DAYS: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  semiannual: 180,
}

// ── i18n strings ─────────────────────────────────────────────────────────────
const t = {
  es: {
    planNames: { monthly: 'Plan Mensual', quarterly: 'Plan Trimestral', semiannual: 'Plan Semestral' },
    email: {
      subjectNew: (plan: string) => `✅ ¡Tu ${plan} R3SET está activo!`,
      subjectRenew: (plan: string) => `🔄 Renovación exitosa — ${plan} R3SET`,
      greeting: (name: string) => `¡Hola, ${name}!`,
      taglineNew: 'Tu acceso está activo. Es hora de empezar.',
      taglineRenew: 'Tu plan fue renovado. Seguí con todo.',
      status: 'Estado',
      statusValue: '✓ Activo',
      duration: 'Duración',
      days: (n: number) => `${n} días`,
      expires: 'Vence el',
      ctaNew: 'Configurar mi cuenta →',
      ctaRenew: 'Ir a mi Dashboard →',
      stepsTitle: 'Cómo empezar en R3SET',
      steps: (email: string) => [
        'Revisá tu email: te enviamos un enlace para acceder al <strong>dashboard</strong> de R3SET',
        `Iniciá sesión con tu email: <strong>${email}</strong>`,
        'Completá tu perfil si te lo pedimos',
        'En breve tu coach va a cargar tus rutinas',
      ],
      renewNote: 'Ya tenés tu cuenta en R3SET. Seguí usando tus credenciales habituales — tus rutinas actualizadas ya están disponibles.',
      coachNote: 'Tu coach va a revisar tu progreso y asignarte el plan para este período.',
      footer: 'Si tenés alguna duda, respondé este email.',
    },
    wa: {
      new: (name: string, plan: string) =>
        `¡Hola ${name}! 🎉\n\nTu *${plan} R3SET* ya está activo.\n\n*Para empezar:*\n1️⃣ Revisá tu email para el enlace al dashboard\n2️⃣ Ingresá con tu email\n3️⃣ Tu coach va a cargar tus rutinas en breve\n\n¡Vamos con todo! 💪`,
      renew: (name: string, plan: string) =>
        `¡Hola ${name}! 🔄\n\nTu *${plan} R3SET* fue renovado exitosamente.\n\nSeguí usando el *dashboard R3SET* con tus credenciales habituales — tu plan ya fue actualizado.\n\n¡Seguimos! 💪`,
    },
  },
  en: {
    planNames: { monthly: 'Monthly Plan', quarterly: 'Quarterly Plan', semiannual: 'Semi-annual Plan' },
    email: {
      subjectNew: (plan: string) => `✅ Your ${plan} R3SET is active!`,
      subjectRenew: (plan: string) => `🔄 Renewal successful — ${plan} R3SET`,
      greeting: (name: string) => `Hi, ${name}!`,
      taglineNew: 'Your access is active. Time to get started.',
      taglineRenew: 'Your plan has been renewed. Keep going strong.',
      status: 'Status',
      statusValue: '✓ Active',
      duration: 'Duration',
      days: (n: number) => `${n} days`,
      expires: 'Expires on',
      ctaNew: 'Set up my account →',
      ctaRenew: 'Go to my Dashboard →',
      stepsTitle: 'How to get started with R3SET',
      steps: (email: string) => [
        'Check your email: we sent a link to the R3SET <strong>dashboard</strong>',
        `Sign in with your email: <strong>${email}</strong>`,
        'Complete your profile if we ask you to',
        'Your coach will load your routines shortly',
      ],
      renewNote: 'You already have your R3SET account. Keep using your usual credentials — your updated routines are already available.',
      coachNote: 'Your coach will review your progress and assign your plan for this period.',
      footer: 'If you have any questions, just reply to this email.',
    },
    wa: {
      new: (name: string, plan: string) =>
        `Hi ${name}! 🎉\n\nYour *${plan} R3SET* is now active.\n\n*To get started:*\n1️⃣ Check your email for the dashboard link\n2️⃣ Sign in with your email\n3️⃣ Your coach will load your routines shortly\n\nLet's go! 💪`,
      renew: (name: string, plan: string) =>
        `Hi ${name}! 🔄\n\nYour *${plan} R3SET* was successfully renewed.\n\nKeep using the *R3SET dashboard* with your usual credentials — your plan has been updated.\n\nKeep it up! 💪`,
    },
  },
  pt: {
    planNames: { monthly: 'Plano Mensal', quarterly: 'Plano Trimestral', semiannual: 'Plano Semestral' },
    email: {
      subjectNew: (plan: string) => `✅ Seu ${plan} R3SET está ativo!`,
      subjectRenew: (plan: string) => `🔄 Renovação bem-sucedida — ${plan} R3SET`,
      greeting: (name: string) => `Olá, ${name}!`,
      taglineNew: 'Seu acesso está ativo. Hora de começar.',
      taglineRenew: 'Seu plano foi renovado. Continue forte.',
      status: 'Status',
      statusValue: '✓ Ativo',
      duration: 'Duração',
      days: (n: number) => `${n} dias`,
      expires: 'Expira em',
      ctaNew: 'Configurar minha conta →',
      ctaRenew: 'Ir para o meu Dashboard →',
      stepsTitle: 'Como começar no R3SET',
      steps: (email: string) => [
        'Verifique seu email: enviamos um link para o <strong>dashboard</strong> R3SET',
        `Entre com seu email: <strong>${email}</strong>`,
        'Complete seu perfil se pedirmos',
        'Em breve seu coach vai carregar suas rotinas',
      ],
      renewNote: 'Você já tem sua conta no R3SET. Continue usando suas credenciais habituais — suas rotinas atualizadas já estão disponíveis.',
      coachNote: 'Seu coach vai revisar seu progresso e atribuir seu plano para este período.',
      footer: 'Se tiver alguma dúvida, responda este email.',
    },
    wa: {
      new: (name: string, plan: string) =>
        `Olá ${name}! 🎉\n\nSeu *${plan} R3SET* já está ativo.\n\n*Para começar:*\n1️⃣ Verifique seu email para o link do dashboard\n2️⃣ Entre com seu email\n3️⃣ Seu coach vai carregar suas rotinas em breve\n\nVamos nessa! 💪`,
      renew: (name: string, plan: string) =>
        `Olá ${name}! 🔄\n\nSeu *${plan} R3SET* foi renovado com sucesso.\n\nContinue usando o *dashboard R3SET* com suas credenciais habituais — seu plano já foi atualizado.\n\nContinue assim! 💪`,
    },
  },
}

type Locale = keyof typeof t

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('MP Webhook recibido:', JSON.stringify(body))

    if (body.type !== 'payment' || !body.data?.id) {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data.id
    const mpAccessToken = process.env.MP_ACCESS_TOKEN

    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpAccessToken}` },
    })

    if (!paymentRes.ok) {
      console.error('Error al obtener pago de MP')
      return NextResponse.json({ error: 'Error MP' }, { status: 500 })
    }

    const payment = await paymentRes.json()
    console.log('MP Payment status:', payment.status, 'external_ref:', payment.external_reference)

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true, skipped: `status=${payment.status}` })
    }

    const subscriptionId = payment.external_reference
    if (!subscriptionId) {
      console.error('Sin external_reference en el pago')
      return NextResponse.json({ ok: true })
    }

    const supabase = createClient()

    // Obtener la suscripción actual
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('*, plans(duration_days)')
      .eq('id', subscriptionId)
      .single()

    if (subError || !sub) {
      console.error('Suscripción no encontrada:', subscriptionId)
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 })
    }

    // Calcular fechas
    const startedAt = new Date()
    const days = PLAN_DAYS[sub.plan_id] ?? 30
    const expiresAt = new Date(startedAt.getTime() + days * 24 * 60 * 60 * 1000)

    // Activar suscripción
    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        mp_payment_id: String(paymentId),
        mp_status: payment.status,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', subscriptionId)

    // Detectar si es cliente nuevo o recurrente
    // (tiene otras suscripciones previas activas/expiradas, excluyendo la actual)
    const { count: prevCount } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', sub.user_id)
      .neq('id', subscriptionId)
      .in('status', ['active', 'expired'])

    const isReturning = (prevCount ?? 0) > 0

    // Obtener datos del usuario
    const { data: { user } } = await supabase.auth.admin.getUserById(sub.user_id)
    const userEmail = user?.email ?? payment.payer?.email ?? ''
    const userMeta = user?.user_metadata ?? {}

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', sub.user_id)
      .single()

    const displayName = profile?.full_name ?? userMeta.full_name ?? userEmail.split('@')[0]
    const phone = profile?.phone ?? ''

    // Locale guardado al crear la preferencia, o 'es' por defecto
    const locale: Locale = (sub.locale ?? 'es') as Locale
    const strings = t[locale] ?? t.es
    const planName = strings.planNames[sub.plan_id as keyof typeof strings.planNames] ?? sub.plan_id

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Disparar notificaciones
    Promise.all([
      sendEmail({ userEmail, displayName, planName, days, expiresAt, isReturning, locale, strings, siteUrl }),
      phone ? sendWhatsApp({ phone, displayName, planName, isReturning, strings }) : Promise.resolve(),
    ]).catch(err => console.error('Error en notificaciones:', err))

    console.log(`Suscripción activada: ${subscriptionId} | ${isReturning ? 'RECURRENTE' : 'NUEVO'} | locale: ${locale}`)
    return NextResponse.json({ ok: true, activated: subscriptionId, isReturning })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ── Email via Resend ──────────────────────────────────────────────────────────
async function sendEmail({
  userEmail, displayName, planName, days, expiresAt,
  isReturning, locale, strings, siteUrl,
}: {
  userEmail: string
  displayName: string
  planName: string
  days: number
  expiresAt: Date
  isReturning: boolean
  locale: string
  strings: typeof t['es']
  siteUrl: string
}) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) { console.warn('RESEND_API_KEY no configurado'); return }

  const expiresFormatted = expiresAt.toLocaleDateString(
    locale === 'pt' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-AR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )

  const subject = isReturning
    ? strings.email.subjectRenew(planName)
    : strings.email.subjectNew(planName)

  const ctaHref = isReturning
    ? `${siteUrl}/${locale}/dashboard`
    : `${siteUrl}/${locale}/dashboard`

  const stepsHtml = !isReturning
    ? `
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:28px;margin-bottom:24px;">
      <p style="font-size:11px;font-weight:700;color:#c1ed00;text-transform:uppercase;letter-spacing:2px;margin:0 0 20px">${strings.email.stepsTitle}</p>
      ${strings.email.steps(userEmail).map((step, i) => `
        <div style="display:flex;gap:14px;margin-bottom:16px;align-items:flex-start;">
          <div style="background:#c1ed00;color:#0e0e0e;font-weight:900;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;line-height:26px;text-align:center;">${i + 1}</div>
          <p style="margin:0;font-size:14px;color:#c8c5c5;line-height:1.6;">${step}</p>
        </div>
      `).join('')}
    </div>`
    : `
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-left:3px solid #c1ed00;border-radius:0 16px 16px 0;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:14px;color:#c8c5c5;line-height:1.6;">${strings.email.renewNote}</p>
      <p style="margin:0;font-size:13px;color:#888;">${strings.email.coachNote}</p>
    </div>`

  const html = `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:32px;">
          <p style="margin:0;font-size:26px;font-weight:900;color:#c1ed00;letter-spacing:-1px;text-transform:uppercase;">R3SET</p>
          <p style="margin:4px 0 0;font-size:11px;color:#444;text-transform:uppercase;letter-spacing:3px;">MÉTODO R3SET</p>
        </td></tr>

        <!-- Heading -->
        <tr><td style="padding-bottom:8px;">
          <p style="margin:0;font-size:28px;font-weight:800;line-height:1.2;">${strings.email.greeting(displayName)}</p>
        </td></tr>
        <tr><td style="padding-bottom:32px;">
          <p style="margin:0;font-size:15px;color:#888;">${isReturning ? strings.email.taglineRenew : strings.email.taglineNew}</p>
        </td></tr>

        <!-- Plan card -->
        <tr><td style="padding-bottom:24px;">
          <div style="background:#141414;border:1px solid #2a2a2a;border-radius:16px;padding:24px;overflow:hidden;">
            <div style="display:inline-block;background:#c1ed00;color:#0e0e0e;font-weight:800;font-size:12px;padding:4px 14px;border-radius:100px;margin-bottom:20px;text-transform:uppercase;letter-spacing:1px;">${planName}</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;">${strings.email.status}</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#c1ed00;font-weight:700;text-align:right;">${strings.email.statusValue}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;">${strings.email.duration}</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#fff;font-weight:600;text-align:right;">${strings.email.days(days)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#888;">${strings.email.expires}</td>
                <td style="padding:10px 0;font-size:13px;color:#fff;font-weight:600;text-align:right;">${expiresFormatted}</td>
              </tr>
            </table>
          </div>
        </td></tr>

        <!-- CTA button -->
        <tr><td style="padding-bottom:28px;text-align:center;">
          <a href="${ctaHref}"
            style="display:inline-block;background:#c1ed00;color:#0e0e0e;font-weight:800;font-size:15px;padding:16px 36px;border-radius:12px;text-decoration:none;letter-spacing:-0.3px;">
            ${isReturning ? strings.email.ctaRenew : strings.email.ctaNew}
          </a>
        </td></tr>

        <!-- Steps / note -->
        <tr><td>${stepsHtml}</td></tr>

        <!-- Divider -->
        <tr><td style="border-top:1px solid #1a1a1a;padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#444;">${strings.email.footer}</p>
          <p style="margin:8px 0 0;font-size:11px;color:#333;">© R3SET · Pesar Menos Vivir Más</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: 'R3SET <hola@pesarmenosvivirmas.com>',
      to: [userEmail],
      subject,
      html,
    }),
  })

  console.log(`Email enviado a: ${userEmail} | ${isReturning ? 'renovación' : 'nuevo'}`)
}

// ── WhatsApp via Twilio ───────────────────────────────────────────────────────
async function sendWhatsApp({
  phone, displayName, planName, isReturning, strings,
}: {
  phone: string
  displayName: string
  planName: string
  isReturning: boolean
  strings: typeof t['es']
}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM
  if (!accountSid || !authToken || !fromNumber) {
    console.warn('Twilio no configurado, saltando WhatsApp')
    return
  }

  const toNumber = phone.startsWith('+') ? phone : `+54${phone.replace(/^0/, '')}`
  const message = isReturning
    ? strings.wa.renew(displayName, planName)
    : strings.wa.new(displayName, planName)

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: `whatsapp:${toNumber}`,
        Body: message,
      }),
    }
  )

  console.log(`WhatsApp enviado a: ${toNumber} | ${isReturning ? 'renovación' : 'nuevo'}`)
}
