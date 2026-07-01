import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js'

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

/** Helper: get admin Supabase client */
function getAdminClient() {
  return createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

/** Helper: fetch from MP API */
async function mpFetch(path: string) {
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`MP API ${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── Validación de firma MP ──────────────────────────────────────────────
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (webhookSecret) {
      const xSignature = req.headers.get('x-signature') ?? ''
      const xRequestId = req.headers.get('x-request-id') ?? ''

      // Extraer ts y v1 del header "ts=...,v1=..."
      const parts: Record<string, string> = {}
      xSignature.split(',').forEach(part => {
        const [k, v] = part.split('=')
        if (k && v) parts[k.trim()] = v.trim()
      })
      const ts = parts['ts'] ?? ''
      const v1 = parts['v1'] ?? ''

      // data.id desde query param (fuente que MP usa para firmar),
      // fallback al body si no viene en la URL
      const rawBody = await req.clone().json()
      const url     = new URL(req.url)
      const dataId  = url.searchParams.get('data.id') ?? rawBody?.data?.id ?? ''

      // Template oficial MP
      const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`

      // Comparación segura contra timing attacks
      const { createHmac, timingSafeEqual } = await import('crypto')
      const computed    = createHmac('sha256', webhookSecret).update(template).digest('hex')
      const computedBuf = Buffer.from(computed, 'hex')
      const v1Buf       = Buffer.from(v1.length % 2 === 0 ? v1 : '', 'hex')

      const signatureValid =
        computedBuf.length > 0 &&
        v1Buf.length > 0 &&
        computedBuf.length === v1Buf.length &&
        timingSafeEqual(computedBuf, v1Buf)

      if (!signatureValid) {
        console.warn('Webhook MP: firma inválida')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    // ── Fin validación ──────────────────────────────────────────────────────

    const body = await req.json()
    console.log('MP Webhook recibido:', JSON.stringify(body))

    const eventType = body.type
    const dataId = body.data?.id

    if (!dataId) return NextResponse.json({ ok: true })

    // Route by event type
    switch (eventType) {
      case 'payment':
        return await handleOneTimePayment(dataId)
      case 'subscription_preapproval':
        return await handlePreapproval(dataId)
      case 'subscription_authorized_payment':
        return await handleAuthorizedPayment(dataId)
      default:
        console.log(`Webhook type ignorado: ${eventType}`)
        return NextResponse.json({ ok: true })
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ── Handle subscription_preapproval ──────────────────────────────────────────
// Fired when preapproval status changes: authorized, paused, cancelled, pending
async function handlePreapproval(preapprovalId: string) {
  const preapproval = await mpFetch(`/preapproval/${preapprovalId}`)
  console.log('Preapproval status:', preapproval.status, 'id:', preapprovalId)

  const admin = getAdminClient()

  // Find our subscription by mp_preapproval_id
  const { data: sub, error: subError } = await admin
    .from('subscriptions')
    .select('*')
    .eq('mp_preapproval_id', preapprovalId)
    .single()

  if (subError || !sub) {
    // Also try external_reference (our subscription.id)
    if (preapproval.external_reference) {
      const { data: sub2 } = await admin
        .from('subscriptions')
        .select('*')
        .eq('id', preapproval.external_reference)
        .single()
      if (!sub2) {
        console.error('Suscripción no encontrada para preapproval:', preapprovalId)
        return NextResponse.json({ ok: true })
      }
      // Store the preapproval ID if we didn't have it
      if (!sub2.mp_preapproval_id) {
        await admin.from('subscriptions').update({ mp_preapproval_id: preapprovalId }).eq('id', sub2.id)
      }
      return await processPreapprovalStatus(admin, sub2, preapproval)
    }
    console.error('Suscripción no encontrada para preapproval:', preapprovalId)
    return NextResponse.json({ ok: true })
  }

  return await processPreapprovalStatus(admin, sub, preapproval)
}

async function processPreapprovalStatus(
  admin: ReturnType<typeof getAdminClient>,
  sub: any,
  preapproval: any,
) {
  const mpStatus = preapproval.status // authorized | paused | cancelled | pending

  // Map MP preapproval status to our subscription status
  const statusMap: Record<string, string> = {
    authorized: 'active',
    paused: 'paused',
    cancelled: 'cancelled',
    pending: 'pending',
  }
  const newStatus = statusMap[mpStatus] ?? sub.status

  const updateData: Record<string, any> = {
    status: newStatus,
    mp_status: mpStatus,
  }

  // If just authorized (first time), set start date
  if (mpStatus === 'authorized' && sub.status === 'pending') {
    const startedAt = new Date()
    const days = PLAN_DAYS[sub.plan_id] ?? 30
    const expiresAt = new Date(startedAt.getTime() + days * 24 * 60 * 60 * 1000)
    updateData.started_at = startedAt.toISOString()
    updateData.expires_at = expiresAt.toISOString()
  }

  await admin.from('subscriptions').update(updateData).eq('id', sub.id)
  console.log(`Preapproval → subscription ${sub.id} status: ${sub.status} → ${newStatus}`)

  // Send notifications only on first activation (pending → active)
  if (mpStatus === 'authorized' && sub.status === 'pending') {
    await sendActivationNotifications(admin, sub, false, preapproval.auto_recurring?.transaction_amount)
  }

  return NextResponse.json({ ok: true, subscriptionId: sub.id, status: newStatus })
}

// ── Handle subscription_authorized_payment ───────────────────────────────────
// Fired when a recurring payment is collected successfully
async function handleAuthorizedPayment(paymentId: string) {
  const authPayment = await mpFetch(`/authorized_payments/${paymentId}`)
  console.log('Authorized payment status:', authPayment.status, 'preapproval:', authPayment.preapproval_id)

  if (authPayment.status !== 'approved') {
    console.log(`Authorized payment ${paymentId} skipped: status=${authPayment.status}`)
    return NextResponse.json({ ok: true, skipped: `status=${authPayment.status}` })
  }

  const admin = getAdminClient()

  // Find subscription by preapproval ID
  const preapprovalId = authPayment.preapproval_id
  const { data: sub } = await admin
    .from('subscriptions')
    .select('*')
    .eq('mp_preapproval_id', preapprovalId)
    .single()

  if (!sub) {
    console.error('Suscripción no encontrada para authorized_payment, preapproval:', preapprovalId)
    return NextResponse.json({ ok: true })
  }

  // Extend the subscription period from now
  const startedAt = new Date()
  const days = PLAN_DAYS[sub.plan_id] ?? 30
  const expiresAt = new Date(startedAt.getTime() + days * 24 * 60 * 60 * 1000)

  await admin.from('subscriptions').update({
    status: 'active',
    mp_status: 'approved',
    mp_payment_id: String(paymentId),
    started_at: startedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  }).eq('id', sub.id)

  console.log(`Recurring payment collected → subscription ${sub.id} renewed until ${expiresAt.toISOString()}`)

  // Send renewal notifications
  await sendActivationNotifications(admin, sub, true, authPayment.transaction_amount)

  return NextResponse.json({ ok: true, renewed: sub.id })
}

// ── Handle one-time payment (legacy) ─────────────────────────────────────────
async function handleOneTimePayment(paymentId: string) {
  const payment = await mpFetch(`/v1/payments/${paymentId}`)
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

  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .select('*, plans(duration_days)')
    .eq('id', subscriptionId)
    .single()

  if (subError || !sub) {
    console.error('Suscripción no encontrada:', subscriptionId)
    return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 })
  }

  const startedAt = new Date()
  const days = PLAN_DAYS[sub.plan_id] ?? 30
  const expiresAt = new Date(startedAt.getTime() + days * 24 * 60 * 60 * 1000)

  await supabase.from('subscriptions').update({
    status: 'active',
    mp_payment_id: String(paymentId),
    mp_status: payment.status,
    started_at: startedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  }).eq('id', subscriptionId)

  const admin = getAdminClient()
  await sendActivationNotifications(admin, sub, false, payment.transaction_amount)

  console.log(`Pago único activado: ${subscriptionId}`)
  return NextResponse.json({ ok: true, activated: subscriptionId })
}

// ── Shared notification logic ────────────────────────────────────────────────
async function sendActivationNotifications(
  admin: ReturnType<typeof getAdminClient>,
  sub: any,
  isRenewal = false,
  amount?: number,
) {
  try {
    // Detect if user is returning (had previous subscriptions)
    const { count: prevCount } = await admin
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', sub.user_id)
      .neq('id', sub.id)
      .in('status', ['active', 'expired'])

    const isReturning = isRenewal || (prevCount ?? 0) > 0

    const { data: { user } } = await admin.auth.admin.getUserById(sub.user_id)
    const userEmail = user?.email ?? ''
    const userMeta = user?.user_metadata ?? {}

    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, phone')
      .eq('id', sub.user_id)
      .single()

    const displayName = profile?.full_name ?? userMeta.full_name ?? userEmail.split('@')[0]
    const phone = profile?.phone ?? ''

    const locale: Locale = (sub.locale ?? 'es') as Locale
    const strings = t[locale] ?? t.es
    const planName = strings.planNames[sub.plan_id as keyof typeof strings.planNames] ?? sub.plan_id

    const days = PLAN_DAYS[sub.plan_id] ?? 30
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    await Promise.all([
      sendEmail({ userEmail, displayName, planName, days, expiresAt, isReturning, locale, strings, siteUrl }),
      phone ? sendWhatsApp({ phone, displayName, planName, isReturning, strings }) : Promise.resolve(),
      notifyCoach({ displayName, userEmail, phone, planName, amount, expiresAt, isReturning }),
    ])
  } catch (err) {
    console.error('Error en notificaciones:', err)
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

// ── Notificación al coach ─────────────────────────────────────────────────────
async function notifyCoach({
  displayName, userEmail, phone, planName, amount, expiresAt, isReturning,
}: {
  displayName: string
  userEmail: string
  phone: string
  planName: string
  amount?: number
  expiresAt: Date
  isReturning: boolean
}) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM
    const resendKey = process.env.RESEND_API_KEY
    const coachPhone = process.env.NEXT_PUBLIC_COACH_WHATSAPP

    const tipo = isReturning ? 'Renovación' : 'Cliente nuevo ⭐'
    const monto = amount ? `$${amount.toLocaleString('es-AR')} ARS` : 'No disponible'
    const vence = expiresAt.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    const telDisplay = phone || 'No proporcionado'

    // ── WhatsApp al coach via Twilio ──
    if (coachPhone && accountSid && authToken && fromNumber) {
      const coachNumber = coachPhone.startsWith('+') ? coachPhone : `+${coachPhone}`
      const message =
        `🎉 *NUEVO PAGO RECIBIDO*\n\n` +
        `👤 *Cliente:* ${displayName}\n` +
        `📧 *Email:* ${userEmail}\n` +
        `📱 *Teléfono:* ${telDisplay}\n` +
        `📋 *Plan:* ${planName}\n` +
        `💰 *Monto:* ${monto}\n` +
        `📅 *Vence:* ${vence}\n` +
        `⭐ *Tipo:* ${tipo}`

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
            To: `whatsapp:${coachNumber}`,
            Body: message,
          }),
        }
      )
      console.log(`Notificación WhatsApp enviada al coach: ${coachNumber}`)
    }

    // ── Email al coach via Resend ──
    if (resendKey) {
      const subject = `🎉 Nuevo pago recibido - ${displayName}`
      const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <tr><td style="padding-bottom:24px;">
          <p style="margin:0;font-size:26px;font-weight:900;color:#c1ed00;letter-spacing:-1px;text-transform:uppercase;">R3SET</p>
          <p style="margin:4px 0 0;font-size:11px;color:#444;text-transform:uppercase;letter-spacing:3px;">PANEL DEL COACH</p>
        </td></tr>

        <tr><td style="padding-bottom:24px;">
          <p style="margin:0;font-size:22px;font-weight:800;">🎉 Nuevo pago recibido</p>
        </td></tr>

        <tr><td style="padding-bottom:24px;">
          <div style="background:#141414;border:1px solid #2a2a2a;border-left:3px solid #c1ed00;border-radius:0 16px 16px 0;padding:24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;width:40%;">👤 Cliente</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#fff;font-weight:600;">${displayName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;">📧 Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#fff;">${userEmail}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;">📱 Teléfono</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#fff;">${telDisplay}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;">📋 Plan</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#c1ed00;font-weight:700;">${planName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;">💰 Monto</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#fff;font-weight:600;">${monto}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;">📅 Vence</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#fff;">${vence}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#888;">⭐ Tipo</td>
                <td style="padding:10px 0;font-size:13px;color:#fff;">${tipo}</td>
              </tr>
            </table>
          </div>
        </td></tr>

        <tr><td style="border-top:1px solid #1a1a1a;padding-top:20px;">
          <p style="margin:0;font-size:12px;color:#444;">© R3SET · Notificación automática del sistema</p>
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
          to: ['alegerezcoach@gmail.com'],
          subject,
          html,
        }),
      })
      console.log(`Email de notificación enviado al coach`)
    }
  } catch (err) {
    console.error('Error en notifyCoach (no crítico):', err)
  }
}
