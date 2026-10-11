// Textos legales (Privacidad y Términos). Para cambiar algo, editar acá.
export interface LegalSection {
  title: string
  body?: string[]
  list?: string[]
  after?: string[]
}

export interface LegalDoc {
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}

export interface LegalLocale {
  back: string
  privacy: LegalDoc
  terms: LegalDoc
}

const EMAIL = 'info@alegerezcoach.com'

export const legalContent: Record<'es' | 'en', LegalLocale> = {
  es: {
    back: 'Volver al inicio',
    privacy: {
      title: 'Política de Privacidad',
      updated: 'Última actualización: 10 de octubre de 2026',
      intro:
        'En Ale Gerez Coach (Método R3SET) cuidamos tus datos personales. Esta política explica qué información recolectamos, para qué la usamos, con quién la compartimos y cuáles son tus derechos, de acuerdo con la Ley 25.326 de Protección de Datos Personales de la República Argentina.',
      sections: [
        {
          title: '1. Responsable del tratamiento',
          body: [
            `El responsable de tus datos es Alejandro Gerez, titular de Ale Gerez Coach (Método R3SET), con domicilio en la República Argentina. Podés escribirnos a ${EMAIL}.`,
          ],
        },
        {
          title: '2. Qué datos recolectamos',
          body: ['Según cómo uses el sitio, podemos recolectar:'],
          list: [
            'Datos de contacto: nombre, apellido, email, número de WhatsApp o teléfono y ciudad.',
            'Datos de salud y físicos que vos nos informás en la evaluación inicial: peso, altura, objetivo y descripción de tu situación. Son datos sensibles y solo los usamos para armar y acompañar tu proceso.',
            'Datos de tu cuenta: email, contraseña (almacenada de forma cifrada), foto de perfil si la subís, y tu progreso dentro de la plataforma.',
            'Datos de pago: el pago se procesa a través de Mercado Pago. Nosotros no vemos ni guardamos los datos de tu tarjeta; solo recibimos la confirmación del pago y el estado de tu suscripción.',
            'Datos técnicos: dirección IP y datos básicos del dispositivo, usados para seguridad y para evitar abusos (por ejemplo, limitar intentos repetidos en los formularios).',
          ],
        },
        {
          title: '3. Para qué usamos tus datos',
          list: [
            'Responder tu solicitud de evaluación y contactarte por WhatsApp o email.',
            'Crear y administrar tu cuenta y darte acceso a tu plan.',
            'Armar, ajustar y acompañar tu plan de entrenamiento, hábitos y alimentación.',
            'Procesar pagos, renovaciones y cancelaciones.',
            'Enviarte avisos importantes del servicio (confirmaciones, recordatorios, cambios).',
            'Proteger el sitio contra spam, fraudes y usos indebidos.',
            'Cumplir obligaciones legales.',
          ],
          after: [
            'No vendemos tus datos ni los usamos para publicidad de terceros.',
          ],
        },
        {
          title: '4. Con quién compartimos tus datos',
          body: [
            'Para que el servicio funcione usamos proveedores que tratan datos en nuestro nombre y solo para esa finalidad:',
          ],
          list: [
            'Supabase: base de datos y autenticación de cuentas.',
            'Vercel: alojamiento del sitio web.',
            'Mercado Pago: procesamiento de pagos y suscripciones.',
            'Resend: envío de emails.',
            'Meta (WhatsApp) / Twilio: envío de mensajes de WhatsApp.',
            'Upstash: control de intentos para prevenir spam.',
          ],
          after: [
            'Algunos de estos proveedores pueden almacenar datos en servidores fuera de Argentina. Trabajamos solo con proveedores que aplican medidas de seguridad adecuadas. También podemos compartir información si una autoridad competente lo exige por ley.',
          ],
        },
        {
          title: '5. Cookies y almacenamiento del navegador',
          body: [
            'Usamos cookies y almacenamiento local únicamente para el funcionamiento del sitio: mantener tu sesión iniciada, recordar tu idioma y no repetir la animación de entrada en la misma visita. A la fecha no usamos cookies de publicidad ni herramientas de seguimiento de terceros. Podés borrar o bloquear las cookies desde la configuración de tu navegador, aunque algunas funciones (como iniciar sesión) podrían dejar de funcionar.',
          ],
        },
        {
          title: '6. Cuánto tiempo guardamos tus datos',
          body: [
            'Conservamos tus datos mientras tengas una cuenta o una relación activa con nosotros, y luego por el tiempo necesario para cumplir obligaciones legales o resolver reclamos. Cuando ya no sean necesarios, los eliminamos o los anonimizamos.',
          ],
        },
        {
          title: '7. Seguridad',
          body: [
            'Aplicamos medidas técnicas y organizativas razonables para proteger tus datos: conexión cifrada (HTTPS), control de accesos y contraseñas almacenadas de forma cifrada. Ningún sistema es 100% infalible, pero trabajamos para reducir los riesgos.',
          ],
        },
        {
          title: '8. Tus derechos',
          body: [
            'Podés pedirnos en cualquier momento acceder a tus datos, rectificarlos, actualizarlos o suprimirlos. Para ejercer estos derechos escribinos a ' +
              EMAIL +
              ' desde el email con el que te registraste. Respondemos dentro de los plazos que fija la ley.',
            'La Agencia de Acceso a la Información Pública (AAIP) es el órgano de control de la Ley 25.326 y tiene la atribución de atender denuncias y reclamos relacionados con el incumplimiento de las normas de protección de datos personales.',
          ],
        },
        {
          title: '9. Menores de edad',
          body: [
            'Nuestros servicios están dirigidos a personas mayores de 18 años. Si sos menor, necesitás la autorización de tu madre, padre o tutor para usarlos.',
          ],
        },
        {
          title: '10. Cambios en esta política',
          body: [
            'Podemos actualizar esta política. Cuando haya cambios importantes los vamos a informar en el sitio o por email. La fecha de la última actualización figura al principio de esta página.',
          ],
        },
        {
          title: '11. Contacto',
          body: [`Para cualquier consulta sobre privacidad escribinos a ${EMAIL}.`],
        },
      ],
    },
    terms: {
      title: 'Términos y Condiciones',
      updated: 'Última actualización: 10 de octubre de 2026',
      intro:
        'Estos términos regulan el uso del sitio y la contratación de los servicios de Ale Gerez Coach (Método R3SET). Al usar el sitio o contratar un plan, aceptás estas condiciones. Leelas con atención.',
      sections: [
        {
          title: '1. Quiénes somos',
          body: [
            `Ale Gerez Coach (Método R3SET) es un servicio de coaching online de entrenamiento, hábitos y alimentación, a cargo de Alejandro Gerez. Contacto: ${EMAIL}.`,
          ],
        },
        {
          title: '2. Qué ofrecemos',
          body: [
            'Ofrecemos planes de acompañamiento online, entre ellos el Plan Base (suscripción mensual) y la Mentoría 1 a 1 (acompañamiento personalizado, con condiciones y precio a convenir). El detalle de lo que incluye cada plan está publicado en el sitio al momento de la contratación.',
          ],
        },
        {
          title: '3. Importante: salud y responsabilidad',
          list: [
            'El coaching no reemplaza la atención médica, nutricional ni psicológica profesional, ni constituye un diagnóstico o tratamiento.',
            'Antes de empezar cualquier programa de ejercicio o cambio de alimentación, consultá con un profesional de la salud, en especial si tenés obesidad, enfermedades, lesiones, estás embarazada o tomás medicación.',
            'Sos responsable de informarnos con veracidad tu estado de salud, lesiones y limitaciones.',
            'Si sentís dolor, mareos u otro malestar durante el entrenamiento, detenete y consultá a un médico.',
            'Los resultados dependen de cada persona (constancia, hábitos, genética, salud, etc.). No garantizamos resultados específicos. Los casos de transformaciones publicados son experiencias individuales y no una promesa para todos.',
          ],
        },
        {
          title: '4. Requisitos y cuenta',
          body: [
            'Para contratar tenés que ser mayor de 18 años (o contar con autorización de tu madre, padre o tutor). Al crear tu cuenta te comprometés a dar datos verdaderos y a cuidar tu contraseña. Tu cuenta es personal e intransferible.',
          ],
        },
        {
          title: '5. Precios y pagos',
          body: [
            'Los precios se expresan en pesos argentinos (ARS) y se informan en el sitio antes de pagar. Los pagos se procesan a través de Mercado Pago, que se rige por sus propios términos. Podemos modificar los precios; el cambio no afecta al período que ya pagaste y te avisaremos antes de que se aplique a tu próxima renovación.',
          ],
        },
        {
          title: '6. Suscripción, renovación y cancelación',
          list: [
            'El Plan Base es una suscripción mensual que se renueva automáticamente mientras no la canceles.',
            'Podés cancelar cuando quieras, sin permanencia ni penalidades.',
            'Al cancelar, mantenés el acceso hasta el final del período ya abonado. No se realizan reembolsos proporcionales por períodos parciales no utilizados, salvo lo indicado en el punto siguiente.',
            'Para cancelar usá las opciones de tu cuenta o escribinos a ' + EMAIL + '.',
          ],
        },
        {
          title: '7. Derecho de revocación (arrepentimiento)',
          body: [
            `Si contrataste a distancia a través del sitio, tenés derecho a revocar la contratación dentro de los 10 días corridos desde que la realizaste, conforme a la Ley 24.240 de Defensa del Consumidor. Para hacerlo escribinos a ${EMAIL} indicando tu nombre y el email de tu cuenta. Te devolvemos lo pagado por el mismo medio de pago utilizado.`,
          ],
        },
        {
          title: '8. Uso del contenido',
          body: [
            'Los planes de entrenamiento, rutinas, videos, textos, imágenes, marca y demás materiales son propiedad de Ale Gerez Coach o se usan con autorización. Se entregan para tu uso personal. No podés copiarlos, compartirlos, revenderlos ni publicarlos sin permiso por escrito.',
          ],
        },
        {
          title: '9. Conducta',
          body: [
            'Te pedimos un trato respetuoso hacia el coach y hacia otros alumnos, incluida la comunidad privada. Podemos suspender o dar de baja una cuenta ante uso indebido, fraude, incumplimiento de estos términos o conductas ofensivas.',
          ],
        },
        {
          title: '10. Disponibilidad del servicio',
          body: [
            'Hacemos lo posible para que el sitio funcione de forma continua, pero puede haber interrupciones por mantenimiento o causas ajenas a nosotros. No somos responsables por daños derivados de esas interrupciones, en la medida permitida por la ley.',
          ],
        },
        {
          title: '11. Limitación de responsabilidad',
          body: [
            'En la medida permitida por la ley, no respondemos por daños derivados de que no sigas las indicaciones, de información de salud incompleta o inexacta, o del uso incorrecto del contenido. Esto no limita los derechos que la ley te reconoce como consumidor.',
          ],
        },
        {
          title: '12. Datos personales',
          body: [
            'El tratamiento de tus datos se rige por nuestra Política de Privacidad, que forma parte de estos términos.',
          ],
        },
        {
          title: '13. Cambios en los términos',
          body: [
            'Podemos modificar estos términos. Los cambios importantes se informarán en el sitio o por email. Si seguís usando el servicio después del aviso, entendemos que los aceptás.',
          ],
        },
        {
          title: '14. Ley aplicable y jurisdicción',
          body: [
            'Estos términos se rigen por las leyes de la República Argentina. Ante cualquier conflicto, y como consumidor, podés optar por los tribunales competentes de tu domicilio, conforme a la Ley 24.240.',
          ],
        },
        {
          title: '15. Contacto',
          body: [`Para consultas sobre estos términos escribinos a ${EMAIL}.`],
        },
      ],
    },
  },

  en: {
    back: 'Back to home',
    privacy: {
      title: 'Privacy Policy',
      updated: 'Last updated: October 10, 2026',
      intro:
        'At Ale Gerez Coach (R3SET Method) we take care of your personal data. This policy explains what information we collect, what we use it for, who we share it with and what your rights are, in line with Argentina’s Personal Data Protection Law No. 25,326.',
      sections: [
        {
          title: '1. Data controller',
          body: [
            `The controller of your data is Alejandro Gerez, owner of Ale Gerez Coach (R3SET Method), based in Argentina. You can reach us at ${EMAIL}.`,
          ],
        },
        {
          title: '2. What data we collect',
          body: ['Depending on how you use the site, we may collect:'],
          list: [
            'Contact data: first and last name, email, WhatsApp or phone number and city.',
            'Health and physical data that you give us in the initial assessment: weight, height, goal and a description of your situation. This is sensitive data and we only use it to build and support your process.',
            'Account data: email, password (stored encrypted), profile photo if you upload one, and your progress inside the platform.',
            'Payment data: payments are processed by Mercado Pago. We do not see or store your card details; we only receive the payment confirmation and your subscription status.',
            'Technical data: IP address and basic device data, used for security and to prevent abuse (for example, limiting repeated attempts on forms).',
          ],
        },
        {
          title: '3. What we use your data for',
          list: [
            'Answer your assessment request and contact you via WhatsApp or email.',
            'Create and manage your account and give you access to your plan.',
            'Build, adjust and support your training, habits and nutrition plan.',
            'Process payments, renewals and cancellations.',
            'Send you important service notices (confirmations, reminders, changes).',
            'Protect the site against spam, fraud and misuse.',
            'Comply with legal obligations.',
          ],
          after: ['We do not sell your data or use it for third-party advertising.'],
        },
        {
          title: '4. Who we share your data with',
          body: [
            'To run the service we use providers that process data on our behalf and only for that purpose:',
          ],
          list: [
            'Supabase: database and account authentication.',
            'Vercel: website hosting.',
            'Mercado Pago: payment and subscription processing.',
            'Resend: email delivery.',
            'Meta (WhatsApp) / Twilio: WhatsApp messaging.',
            'Upstash: attempt control to prevent spam.',
          ],
          after: [
            'Some of these providers may store data on servers outside Argentina. We only work with providers that apply adequate security measures. We may also share information if a competent authority requires it by law.',
          ],
        },
        {
          title: '5. Cookies and browser storage',
          body: [
            'We use cookies and local storage only for the site to work: keeping you signed in, remembering your language and not repeating the intro animation during the same visit. To date we do not use advertising cookies or third-party tracking tools. You can delete or block cookies in your browser settings, although some features (such as signing in) may stop working.',
          ],
        },
        {
          title: '6. How long we keep your data',
          body: [
            'We keep your data while you have an account or an active relationship with us, and afterwards for as long as needed to meet legal obligations or resolve claims. When it is no longer needed, we delete or anonymize it.',
          ],
        },
        {
          title: '7. Security',
          body: [
            'We apply reasonable technical and organizational measures to protect your data: encrypted connection (HTTPS), access control and encrypted password storage. No system is 100% infallible, but we work to reduce risks.',
          ],
        },
        {
          title: '8. Your rights',
          body: [
            `You can ask us at any time to access, correct, update or delete your data. To exercise these rights write to ${EMAIL} from the email you signed up with. We reply within the deadlines set by law.`,
            'The Agency for Access to Public Information (AAIP) is the supervisory authority under Law 25,326 and handles complaints related to breaches of personal data protection rules.',
          ],
        },
        {
          title: '9. Minors',
          body: [
            'Our services are intended for people over 18. If you are a minor, you need the authorization of a parent or guardian to use them.',
          ],
        },
        {
          title: '10. Changes to this policy',
          body: [
            'We may update this policy. If there are important changes we will announce them on the site or by email. The date of the last update appears at the top of this page.',
          ],
        },
        {
          title: '11. Contact',
          body: [`For any privacy question write to ${EMAIL}.`],
        },
      ],
    },
    terms: {
      title: 'Terms and Conditions',
      updated: 'Last updated: October 10, 2026',
      intro:
        'These terms govern the use of the site and the purchase of Ale Gerez Coach (R3SET Method) services. By using the site or buying a plan, you accept these conditions. Please read them carefully.',
      sections: [
        {
          title: '1. Who we are',
          body: [
            `Ale Gerez Coach (R3SET Method) is an online coaching service for training, habits and nutrition, run by Alejandro Gerez. Contact: ${EMAIL}.`,
          ],
        },
        {
          title: '2. What we offer',
          body: [
            'We offer online coaching plans, including the Base Plan (monthly subscription) and 1-on-1 Mentorship (personalized support, with terms and price agreed individually). What each plan includes is published on the site at the time of purchase.',
          ],
        },
        {
          title: '3. Important: health and responsibility',
          list: [
            'Coaching does not replace professional medical, nutritional or psychological care, and is not a diagnosis or treatment.',
            'Before starting any exercise program or changing your diet, consult a healthcare professional, especially if you have obesity, illnesses, injuries, are pregnant or take medication.',
            'You are responsible for truthfully telling us about your health, injuries and limitations.',
            'If you feel pain, dizziness or other discomfort while training, stop and see a doctor.',
            'Results depend on each person (consistency, habits, genetics, health, etc.). We do not guarantee specific results. Published transformations are individual experiences, not a promise for everyone.',
          ],
        },
        {
          title: '4. Requirements and account',
          body: [
            'To buy you must be over 18 (or have authorization from a parent or guardian). When you create your account you agree to provide true information and keep your password safe. Your account is personal and non-transferable.',
          ],
        },
        {
          title: '5. Prices and payments',
          body: [
            'Prices are in Argentine pesos (ARS) and are shown on the site before you pay. Payments are processed by Mercado Pago, which is governed by its own terms. We may change prices; a change does not affect the period you already paid for, and we will let you know before it applies to your next renewal.',
          ],
        },
        {
          title: '6. Subscription, renewal and cancellation',
          list: [
            'The Base Plan is a monthly subscription that renews automatically until you cancel.',
            'You can cancel at any time, with no lock-in or penalties.',
            'When you cancel, you keep access until the end of the period already paid. We do not give pro-rata refunds for unused partial periods, except as set out in the next section.',
            `To cancel use your account options or write to ${EMAIL}.`,
          ],
        },
        {
          title: '7. Right of withdrawal',
          body: [
            `If you bought remotely through the site, you have the right to withdraw within 10 calendar days from the purchase, under Argentina’s Consumer Protection Law 24,240. To do so write to ${EMAIL} with your name and account email. We refund what you paid through the same payment method.`,
          ],
        },
        {
          title: '8. Use of content',
          body: [
            'Training plans, routines, videos, texts, images, brand and other materials belong to Ale Gerez Coach or are used with permission. They are provided for your personal use. You may not copy, share, resell or publish them without written permission.',
          ],
        },
        {
          title: '9. Conduct',
          body: [
            'We ask for respectful treatment toward the coach and other students, including the private community. We may suspend or close an account for misuse, fraud, breach of these terms or offensive behavior.',
          ],
        },
        {
          title: '10. Service availability',
          body: [
            'We do our best to keep the site running continuously, but there may be interruptions for maintenance or reasons beyond our control. We are not liable for damages caused by those interruptions, to the extent permitted by law.',
          ],
        },
        {
          title: '11. Limitation of liability',
          body: [
            'To the extent permitted by law, we are not liable for damages resulting from not following instructions, incomplete or inaccurate health information, or misuse of the content. This does not limit the rights the law gives you as a consumer.',
          ],
        },
        {
          title: '12. Personal data',
          body: [
            'The handling of your data is governed by our Privacy Policy, which is part of these terms.',
          ],
        },
        {
          title: '13. Changes to the terms',
          body: [
            'We may change these terms. Important changes will be announced on the site or by email. If you keep using the service after the notice, we understand you accept them.',
          ],
        },
        {
          title: '14. Governing law and jurisdiction',
          body: [
            'These terms are governed by the laws of the Argentine Republic. In case of a dispute, as a consumer, you may choose the competent courts of your place of residence, under Law 24,240.',
          ],
        },
        {
          title: '15. Contact',
          body: [`For questions about these terms write to ${EMAIL}.`],
        },
      ],
    },
  },
}
