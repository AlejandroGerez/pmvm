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

  if (!accountSid || !authToken || !fromNumber || !coachPhone) {
    console.warn('Twilio no configurado — saltando WhatsApp de evaluación')
    return
  }

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
