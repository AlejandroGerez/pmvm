import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const OBJETIVO_LABELS: Record<string, string> = {
  bajar:    'Bajar de peso',
  muscular: 'Ganar masa muscular',
  habitos:  'Mejorar hábitos',
  recomp:   'Recomposición corporal',
  otro:     'Otro',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, email, whatsapp, ciudad, peso, altura, skipMedidas, objetivo, situacion } = body

    if (!nombre?.trim() || !email?.trim() || !whatsapp?.trim()) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: nombre, email y WhatsApp son requeridos.' },
        { status: 400 }
      )
    }

    // ── 1. Guardar en Supabase ──
    const admin = createAdminClient()
    const { error: insertError } = await admin
      .from('evaluaciones')
      .insert({
        nombre:   nombre.trim(),
        email:    email.trim().toLowerCase(),
        whatsapp: whatsapp.trim(),
        ciudad:   ciudad?.trim() || null,
        peso:     skipMedidas ? null : (peso ? Number(peso) : null),
        altura:   skipMedidas ? null : (altura ? Number(altura) : null),
        objetivo: objetivo || null,
        situacion: situacion?.trim() || null,
      })

    if (insertError) {
      console.error('Error guardando evaluación en Supabase:', insertError)
      return NextResponse.json(
        { error: 'Error al guardar la evaluación. Intentá de nuevo.' },
        { status: 500 }
      )
    }

    // ── 2. WhatsApp al coach via Twilio (falla silenciosamente) ──
    try {
      await notifyCoach({ nombre, email, whatsapp, ciudad, peso, altura, skipMedidas, objetivo, situacion })
    } catch (err) {
      console.error('Error enviando WhatsApp al coach (no crítico):', err)
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('evaluacion API error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}

async function notifyCoach({
  nombre, email, whatsapp, ciudad, peso, altura, skipMedidas, objetivo, situacion,
}: {
  nombre: string; email: string; whatsapp: string; ciudad?: string
  peso?: string; altura?: string; skipMedidas?: boolean
  objetivo?: string; situacion?: string
}) {
  const accountSid  = process.env.TWILIO_ACCOUNT_SID
  const authToken   = process.env.TWILIO_AUTH_TOKEN
  const fromNumber  = process.env.TWILIO_WHATSAPP_FROM
  const coachPhone  = process.env.NEXT_PUBLIC_COACH_WHATSAPP

  // ── WhatsApp al coach via Twilio ──
  if (!accountSid || !authToken || !fromNumber || !coachPhone) {
    console.warn('Twilio no configurado — saltando WhatsApp de evaluación')
  } else {
    const coachNumber   = coachPhone.startsWith('+') ? coachPhone : `+${coachPhone}`
    const objetivoLabel = OBJETIVO_LABELS[objetivo ?? ''] ?? objetivo ?? 'No especificado'
    const medidas       = skipMedidas
      ? 'Lo compartirá en videollamada'
      : [peso ? `${peso} kg` : null, altura ? `${altura} cm` : null].filter(Boolean).join(' / ') || 'No proporcionado'

    const message =
      `📋 *NUEVA SOLICITUD DE EVALUACIÓN*\n\n` +
      `👤 *Nombre:* ${nombre}\n` +
      `📧 *Email:* ${email}\n` +
      `📱 *WhatsApp:* ${whatsapp}\n` +
      `📍 *Ciudad:* ${ciudad || 'No especificada'}\n` +
      `⚖️ *Peso / Altura:* ${medidas}\n` +
      `🎯 *Objetivo:* ${objetivoLabel}\n` +
      `📝 *Situación:*\n${situacion || 'No especificada'}`

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
          To:   `whatsapp:${coachNumber}`,
          Body: message,
        }),
      }
    )
    console.log(`WhatsApp de evaluación enviado al coach: ${coachNumber}`)
  }

  // ── Email al coach via Resend ──
  try {
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const objetivoLabel = OBJETIVO_LABELS[objetivo ?? ''] ?? objetivo ?? 'No especificado'
      const medidas       = skipMedidas
        ? 'Lo compartirá en videollamada'
        : [peso ? `${peso} kg` : null, altura ? `${altura} cm` : null].filter(Boolean).join(' / ') || 'No proporcionado'
      const subject = `Nueva solicitud de evaluación - ${nombre}`
      const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td style="padding-bottom:24px;">
          <p style="margin:0;font-size:26px;font-weight:900;color:#c1ed00;letter-spacing:-1px;text-transform:uppercase;">R3SET</p>
          <p style="margin:4px 0 0;font-size:11px;color:#444;text-transform:uppercase;letter-spacing:3px;">NUEVA EVALUACIÓN</p>
        </td></tr>
        <tr><td style="padding-bottom:24px;">
          <p style="margin:0;font-size:22px;font-weight:800;">📋 Nueva solicitud de evaluación</p>
        </td></tr>
        <tr><td style="padding-bottom:24px;">
          <div style="background:#141414;border:1px solid #2a2a2a;border-left:3px solid #c1ed00;border-radius:0 16px 16px 0;padding:24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;width:40%;">👤 Nombre</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#fff;font-weight:600;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;">📧 Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#fff;">${email}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;">📱 WhatsApp</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#fff;">${whatsapp}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;">📍 Ciudad</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#fff;">${ciudad || 'No especificada'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;">⚖️ Peso / Altura</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#fff;">${medidas}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#888;">🎯 Objetivo</td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#c1ed00;font-weight:700;">${objetivoLabel}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#888;vertical-align:top;">📝 Situación</td>
                <td style="padding:10px 0;font-size:13px;color:#fff;white-space:pre-wrap;">${situacion || 'No especificada'}</td>
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: 'Ale Gerez Coach <info@alegerezcoach.com>',
          to: ['info@alegerezcoach.com'],
          subject,
          html,
        }),
      })
      console.log('Email de evaluación enviado al coach')
    }
  } catch (emailErr) {
    console.error('Error enviando email de evaluación (no crítico):', emailErr)
  }
}
