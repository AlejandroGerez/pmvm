'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const texts = {
  es: {
    greeting: 'UN ÚLTIMO PASO',
    subtitle: 'Completá tu perfil para que tu entrenador pueda contactarte.',
    phone: 'Número de WhatsApp',
    phonePlaceholder: '+54 9 11 1234-5678',
    phoneHint: 'Tu entrenador te contactará por acá.',
    sex: '¿Con qué género te identificás?',
    sexMale: 'Masculino',
    sexFemale: 'Femenino',
    sexOther: 'Otro',
    language: 'Idioma de preferencia',
    button: 'COMPLETAR PERFIL',
    loading: 'Guardando...',
    skip: 'Saltar por ahora',
    error: 'Hubo un error. Intentá de nuevo.',
  },
  en: {
    greeting: 'ONE LAST STEP',
    subtitle: 'Complete your profile so your trainer can reach you.',
    phone: 'WhatsApp Number',
    phonePlaceholder: '+1 555 123-4567',
    phoneHint: 'Your trainer will contact you here.',
    sex: 'How do you identify?',
    sexMale: 'Male',
    sexFemale: 'Female',
    sexOther: 'Other',
    language: 'Preferred language',
    button: 'COMPLETE PROFILE',
    loading: 'Saving...',
    skip: 'Skip for now',
    error: 'An error occurred. Please try again.',
  },
  pt: {
    greeting: 'UM ÚLTIMO PASSO',
    subtitle: 'Complete seu perfil para que seu treinador possa entrar em contato.',
    phone: 'Número do WhatsApp',
    phonePlaceholder: '+55 11 91234-5678',
    phoneHint: 'Seu treinador irá te contatar por aqui.',
    sex: 'Com qual gênero você se identifica?',
    sexMale: 'Masculino',
    sexFemale: 'Feminino',
    sexOther: 'Outro',
    language: 'Idioma preferido',
    button: 'COMPLETAR PERFIL',
    loading: 'Salvando...',
    skip: 'Pular por agora',
    error: 'Ocorreu um erro. Tente novamente.',
  },
}

const languages = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
]

export default function OnboardingPage({
  params,
}: {
  params: { locale: string }
}) {
  const router = useRouter()
  const supabase = createClient()
  const t = texts[params.locale as keyof typeof texts] ?? texts.es

  const [phone, setPhone] = useState('')
  const [sex, setSex] = useState<'male' | 'female' | 'other' | null>(null)
  const [language, setLanguage] = useState(params.locale)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (skip = false) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/${params.locale}/login`); return }

      const updates: Record<string, unknown> = { onboarding_completed: true }
      if (!skip) {
        if (phone.trim()) updates.phone = phone.trim()
        if (sex) updates.sex = sex
        if (language) updates.locale = language
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (updateError) throw updateError

      // Redirigir al dashboard con el locale seleccionado
      const targetLocale = !skip && language ? language : params.locale
      router.push(`/${targetLocale}/dashboard`)
    } catch (e) {
      console.error('[onboarding] error:', e)
      setError(t.error)
      setLoading(false)
    }
  }

  const sexOptions: { key: 'male' | 'female' | 'other'; label: string }[] = [
    { key: 'male', label: t.sexMale },
    { key: 'female', label: t.sexFemale },
    { key: 'other', label: t.sexOther },
  ]

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-10">
          <p className="font-label text-xs uppercase tracking-[0.3em] text-[#c8f73a] mb-3">R3SET</p>
          <h1 className="font-headline font-black text-4xl text-white leading-tight">
            {t.greeting}
          </h1>
          <p className="font-body text-white/50 mt-3 text-sm leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="space-y-8">

          {/* Phone */}
          <div>
            <label className="font-label text-xs uppercase tracking-widest text-white/40 block mb-3">
              {t.phone}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder={t.phonePlaceholder}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-body placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 focus:bg-white/8 transition-all"
            />
            <p className="font-label text-[11px] text-white/30 mt-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t.phoneHint}
            </p>
          </div>

          {/* Sex */}
          <div>
            <label className="font-label text-xs uppercase tracking-widest text-white/40 block mb-3">
              {t.sex}
            </label>
            <div className="flex gap-2">
              {sexOptions.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSex(opt.key)}
                  className={`flex-1 py-3 rounded-xl font-label text-xs uppercase tracking-wider transition-all border ${
                    sex === opt.key
                      ? 'bg-[#c8f73a] text-black border-[#c8f73a] font-bold'
                      : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="font-label text-xs uppercase tracking-widest text-white/40 block mb-3">
              {t.language}
            </label>
            <div className="flex gap-2">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`flex-1 py-3 rounded-xl font-label text-xs uppercase tracking-wider transition-all border ${
                    language === lang.code
                      ? 'bg-[#c8f73a] text-black border-[#c8f73a] font-bold'
                      : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 font-label text-xs text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="w-full bg-[#c8f73a] text-black font-headline font-black text-sm py-4 rounded-xl hover:bg-[#d4ff45] transition-colors disabled:opacity-60 disabled:cursor-not-allowed tracking-wider"
          >
            {loading ? t.loading : t.button}
          </button>

          {/* Skip */}
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="w-full text-white/30 font-label text-xs hover:text-white/60 transition-colors py-2"
          >
            {t.skip}
          </button>
        </div>
      </div>
    </div>
  )
}
