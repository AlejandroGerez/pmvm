interface WhatsAppMessage {
  to: string
  body: string
  template: string
  templateParams: string[]
  language?: string
}

export async function sendWhatsAppMessage({
  to, body, template, templateParams, language = 'es_AR',
}: WhatsAppMessage): Promise<void> {
  const provider = process.env.WHATSAPP_PROVIDER ?? 'twilio'

  if (provider === 'meta') {
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID
    const accessToken   = process.env.META_ACCESS_TOKEN
    if (!phoneNumberId || !accessToken) {
      console.error('Meta WhatsApp: faltan META_PHONE_NUMBER_ID o META_ACCESS_TOKEN — saltando')
      return
    }
    try {
      const metaRes = await fetch(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
              name: template,
              language: { code: language },
              components: [
                {
                  type: 'body',
                  parameters: templateParams.map(text => ({ type: 'text', text })),
                },
              ],
            },
          }),
        }
      )
      if (metaRes.ok) {
        console.log(`WhatsApp (Meta) enviado a: ${to} | plantilla: ${template}`)
      } else {
        const errBody = await metaRes.text()
        console.error(`Meta WhatsApp error [${metaRes.status}]:`, errBody)
      }
    } catch (metaErr) {
      console.error('Meta WhatsApp error de red (no crítico):', metaErr)
    }
    return
  }

  // ── Provider: twilio (default) ──
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM
  if (!accountSid || !authToken || !fromNumber) {
    console.warn('Twilio no configurado — saltando WhatsApp')
    return
  }
  try {
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
          To:   `whatsapp:${to}`,
          Body: body,
        }),
      }
    )
    console.log(`WhatsApp (Twilio) enviado a: ${to}`)
  } catch (twilioErr) {
    console.error('Twilio WhatsApp error de red (no crítico):', twilioErr)
  }
}
