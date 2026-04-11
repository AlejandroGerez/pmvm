import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const texts = {
  es: {
    label: 'CONTACTO',
    title: 'TU',
    titleAccent: 'ENTRENADOR.',
    subtitle: 'Escribile directo por WhatsApp.',
    writeBtn: 'Escribir por WhatsApp',
    noTrainer: 'Todavía no tenés un entrenador asignado.',
    noTrainerSub: 'Pronto te asignaremos uno. Si tenés dudas, contactanos.',
    noPhone: 'Tu entrenador aún no tiene número de WhatsApp cargado.',
    noPhoneSub: 'Podés contactarlo por otro medio mientras tanto.',
  },
  en: {
    label: 'CONTACT',
    title: 'YOUR',
    titleAccent: 'TRAINER.',
    subtitle: 'Message them directly on WhatsApp.',
    writeBtn: 'Message on WhatsApp',
    noTrainer: "You don't have a trainer assigned yet.",
    noTrainerSub: "We'll assign one soon. Contact us if you have questions.",
    noPhone: "Your trainer doesn't have a WhatsApp number set up yet.",
    noPhoneSub: 'You can reach them through another channel in the meantime.',
  },
  pt: {
    label: 'CONTATO',
    title: 'SEU',
    titleAccent: 'TREINADOR.',
    subtitle: 'Escreva diretamente pelo WhatsApp.',
    writeBtn: 'Escrever pelo WhatsApp',
    noTrainer: 'Você ainda não tem um treinador atribuído.',
    noTrainerSub: 'Em breve atribuiremos um. Entre em contato se tiver dúvidas.',
    noPhone: 'Seu treinador ainda não tem número do WhatsApp cadastrado.',
    noPhoneSub: 'Você pode contatá-lo por outro meio enquanto isso.',
  },
}

export default async function DashboardMessagesPage({ params }: { params: { locale: string } }) {
  const t = texts[params.locale as keyof typeof texts] ?? texts.es
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${params.locale}/login`)

  // Obtener trainer_id del cliente
  const { data: profile } = await supabase
    .from('profiles')
    .select('trainer_id, full_name')
    .eq('id', user.id)
    .single()

  // Obtener datos del trainer si existe
  let trainer: { full_name: string | null; phone: string | null } | null = null
  if (profile?.trainer_id) {
    const admin = createAdminClient()
    const { data: trainerData } = await admin
      .from('profiles')
      .select('full_name, phone')
      .eq('id', profile.trainer_id)
      .single()
    trainer = trainerData
  }

  const clientName = profile?.full_name ?? ''
  const waUrl = trainer?.phone
    ? `https://wa.me/${trainer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Soy ${clientName}. Te escribo desde R3SET 💪`)}`
    : null

  const trainerInitial = (trainer?.full_name ?? 'E')[0].toUpperCase()

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs font-black tracking-[0.2em] text-white/30 mb-1">{t.label}</p>
        <h1 className="text-5xl font-black tracking-tight text-white leading-none">
          {t.title}<br />
          <span className="text-[#c1ed00] italic">{t.titleAccent}</span>
        </h1>
        <p className="text-white/40 text-sm mt-3">{t.subtitle}</p>
      </div>

      {/* Sin trainer asignado */}
      {!profile?.trainer_id && (
        <div className="w-full max-w-sm bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-white/20 mb-4 block">person_search</span>
          <p className="text-white font-bold mb-1">{t.noTrainer}</p>
          <p className="text-white/40 text-sm">{t.noTrainerSub}</p>
        </div>
      )}

      {/* Tiene trainer pero sin teléfono */}
      {profile?.trainer_id && trainer && !trainer.phone && (
        <div className="w-full max-w-sm bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#c1ed00]/15 flex items-center justify-center text-[#c1ed00] font-black text-2xl mx-auto mb-4">
            {trainerInitial}
          </div>
          <p className="text-white font-bold mb-1">{trainer.full_name}</p>
          <p className="text-white/40 text-sm mt-3">{t.noPhone}</p>
          <p className="text-white/25 text-xs mt-1">{t.noPhoneSub}</p>
        </div>
      )}

      {/* Tiene trainer con teléfono → mostrar card + botón */}
      {profile?.trainer_id && trainer && trainer.phone && (
        <div className="w-full max-w-sm space-y-4">
          {/* Trainer card */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#c1ed00]/15 flex items-center justify-center text-[#c1ed00] font-black text-2xl flex-shrink-0">
              {trainerInitial}
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.15em] text-white/30 uppercase mb-0.5">Tu entrenador</p>
              <p className="text-lg font-black text-white">{trainer.full_name}</p>
              <p className="text-sm text-white/30 font-mono mt-0.5">{trainer.phone}</p>
            </div>
          </div>

          {/* WhatsApp button */}
          <a
            href={waUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white font-black py-4 rounded-2xl hover:bg-[#20b858] active:scale-[0.98] transition-all text-sm tracking-widest"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t.writeBtn}
          </a>

          <p className="text-center text-[10px] text-white/15">
            Se abre WhatsApp con un mensaje prellenado. Podés editarlo antes de enviarlo.
          </p>
        </div>
      )}
    </div>
  )
}
