# 📋 CONTEXTO PARA NUEVA CONVERSACIÓN
Proyecto: alegerezcoach.com — landing page de coaching fitness de Alejandro Gerez (Método R3SET).
Repositorio: github.com/juancrossetto/pmvm, carpeta local: ~/Desktop/pmvm.
Stack: Next.js 14, Tailwind, Supabase, Mercado Pago, Twilio (WhatsApp), Resend (email), Vercel.

## Flujo de trabajo establecido:
- Servidor local: Git Bash ventana 1 → npm run dev → ver en localhost:3000/es/v4secret
- Claude Code: Git Bash ventana 2 → claude (tiene CLAUDE.md con contexto del proyecto)
- Comandos Git: Git Bash ventana 3
- Publicar: git add -A → git commit -m "descripción" → git push → Vercel publica en 1-2 min

## Páginas creadas/rediseñadas:
- /es/v4secret → landing principal (navbar, hero, coach, transformaciones, pricing, FAQ, contacto)
- /es/checkout → rediseñado completo (selector de planes, formulario sin contraseña por flag)
- /es/checkout/success → pantalla pago exitoso
- /es/checkout/failure → pantalla pago rechazado
- /es/evaluacion → formulario de evaluación para Mentoría 1 a 1
- /es/evaluacion/gracias → pantalla post-envío formulario

## Variables de entorno importantes (.env.local):
- NEXT_PUBLIC_CUENTA_HABILITADA=false → oculta contraseña (se activa cuando esté lista la app mobile)
- NEXT_PUBLIC_COACH_WHATSAPP=5491170632860
- NEXT_PUBLIC_COACH_PHONE_DISPLAY=+54 9 11 7063-2860
- NEXT_PUBLIC_SITE_URL=https://www.alegerezcoach.com (cambiado de localhost para que MP acepte back_url)
- MP_ACCESS_TOKEN=TEST-... (token de prueba de la app alegerezcoach-web en MP)
- RESEND_API_KEY=re_... (creada, pendiente verificar dominio DNS en Vercel)
- .env.local NUNCA se toca ni se sube a GitHub

## Imágenes/logos:
- public/images/logo-r3set.png → logo principal
- public/images/mercadopago/SVGs/MP_RGB_HANDSHAKE_pluma_horizontal.svg → logo MP blanco (usado debajo del botón de pago)
- public/images/mercadopago/SVGs/MP_RGB_HANDSHAKE_color_horizontal.svg → logo MP color (usado en método de pago)

## Estilo que NO se toca:
- Fondo: #0e0e0e
- Verde lima: #c1ed00
- Cyan: #00e3fd
- Tipografía en mayúsculas, estilo fitness/deportivo

## Lo que está implementado:
- Precios reales ARS: mensual $44.999, trimestral $119.999, semestral $219.999
- Los 3 planes son suscripciones RECURRENTES (Preapproval de MP): mensual cada 1 mes, trimestral cada 3 meses, semestral cada 6 meses
- Mentoría 1-1 NO tiene cobro web → solo va al formulario /es/evaluacion
- Webhook de MP funcionando (/api/mp/webhook) → activa suscripción en Supabase + notifica coach
- API de evaluación creada (/api/evaluacion/route.ts) → guarda en Supabase tabla "evaluaciones" + intenta WhatsApp por Twilio
- Tabla "evaluaciones" creada en Supabase con RLS activado
- Logo oficial de Mercado Pago implementado en checkout (dos zonas)
- App de MP creada: "alegerezcoach-web" con integración de Suscripciones
- Notificaciones al coach: notifyCoach() → WhatsApp + email cuando llega un pago

## Mercado Pago — estado actual:
- App: alegerezcoach-web (separada de la app mobile)
- Token actual en .env.local: TEST- (modo prueba)
- Flujo de pago confirmado: llega correctamente a la pantalla de MP con plan y precio correcto
- Para producción: cambiar MP_ACCESS_TOKEN a APP_USR- (el de producción)
- El webhook todavía NO está registrado en el panel de MP (requiere URL pública → hacerlo después de publicar a Vercel)

## Vercel — estado actual (lo maneja Juan):
- El DNS del dominio apunta a Vercel (ns1.vercel-dns.com / ns2.vercel-dns.com)
- Variables pendientes de agregar en Vercel:
  * MP_ACCESS_TOKEN → poner el de PRODUCCIÓN (APP_USR-...) cuando estén listos
  * NEXT_PUBLIC_COACH_WHATSAPP → 5491170632860
  * NEXT_PUBLIC_COACH_PHONE_DISPLAY → +54 9 11 7063-2860
  * TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM → pendiente configurar Twilio
  * RESEND_API_KEY → ya creada, pendiente agregar en Vercel
- Registros DNS de Resend pendientes de agregar en Vercel (para emails desde @alegerezcoach.com):
  * TXT: resend._domainkey → valor largo de DKIM
  * MX: send → feedback...ses.com (priority 10)
  * TXT: send → v=spf1...~all
  * TXT: _dmarc → v=DMARC1; p=none;

## Supabase — estado actual (lo maneja Juan, ya tenés acceso):
- Proyecto: pmvm (fpmybddwsdiznnlpqqpe.supabase.co) — STATUS: Healthy
- Tabla "evaluaciones" creada con columnas: id, nombre, email, whatsapp, ciudad, peso, altura, objetivo, situacion, created_at
- El proyecto se había pausado (causa del primer "fetch failed"), ya está activo

## Twilio — estado actual:
- NO configurado todavía
- Variables que necesita: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
- Sin Twilio: los datos del formulario se guardan igual en Supabase, solo no llega el WhatsApp al coach

## Resend (emails) — estado actual:
- Cuenta creada, API Key generada (RESEND_API_KEY=re_...)
- Dominio alegerezcoach.com agregado en Resend pero pendiente verificar
- Los registros DNS hay que cargarlos en Vercel (no en Donweb, porque el DNS lo maneja Vercel)
- Sin Resend: los pagos se procesan igual, solo no llegan emails de confirmación

## Lo que FALTA hacer (próxima sesión):
1. Terminar cambios en sección "Transformaciones Reales" de la landing:
   - ✅ Invertir fotos de Maximiliano y Carla (antes/después estaban al revés)
   - ✅ Eliminar efecto zoom en foto del después
   - ✅ Reducir gap entre fotos antes/después
   - ✅ Corregir textos testimonios en español argentino
   - Verificar que todo quedó bien visualmente
2. Repaso mobile de todas las pantallas
3. Animaciones radar (pulso de adentro hacia afuera) en pantallas de pago
4. Configurar Twilio (WhatsApp)
5. Pedirle a Juan que agregue en Vercel TODAS las variables de entorno nuevas + registros DNS de Resend
6. Registrar webhook en panel de MP (URL: https://www.alegerezcoach.com/api/mp/webhook)
7. Cambiar MP_ACCESS_TOKEN a producción (APP_USR-) en Vercel
8. Hacer pago real de $1 para probar el flujo completo de punta a punta
9. Fix definitivo del flag cuentaHabilitada (cambiar === 'true' por !== 'false') — pendiente aplicar

## Importante sobre los precios:
- Lo que se MUESTRA está en DISPLAY_PRICES del checkout
- Lo que se COBRA está en create-subscription/route.ts
- Los DOS tienen que coincidir siempre

## Importante sobre el acceso post-pago:
- El flujo es 100% automático cuando la cuenta esté habilitada
- Por ahora NEXT_PUBLIC_CUENTA_HABILITADA=false → se crea cuenta con contraseña aleatoria en Supabase
- El cliente ve la pantalla de "¡Bienvenido! Te contactamos por WhatsApp"
- Cuando la app mobile esté lista → cambiar flag a true en .env.local Y en Vercel
