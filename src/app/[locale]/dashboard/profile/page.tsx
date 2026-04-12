'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export default function ClientProfilePage({ params }: { params: { locale: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('app.profile')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [userId, setUserId] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [sex, setSex] = useState<'male' | 'female' | 'other' | ''>('')
  const [locale, setLocaleVal] = useState(params.locale)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/${params.locale}/login`); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, sex, locale, avatar_url')
        .eq('id', user.id)
        .single()
      if (data) {
        setFullName(data.full_name ?? '')
        setPhone(data.phone ?? '')
        setSex((data.sex as any) ?? '')
        setLocaleVal(data.locale ?? params.locale)
        setAvatarUrl(data.avatar_url ?? null)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploadingAvatar(true)
    setError(null)
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) { setError(t('avatar_error')); setUploadingAvatar(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId)
    if (updateError) setError(t('avatar_save_error'))
    else setAvatarUrl(`${publicUrl}?t=${Date.now()}`)
    setUploadingAvatar(false)
    e.target.value = ''
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    const { error: err } = await supabase.from('profiles').update({
      full_name: fullName.trim() || null,
      phone: phone.trim() || null,
      sex: sex || null,
      locale,
    }).eq('id', userId)
    if (err) {
      setError(t('save_error'))
      setSaving(false)
    } else {
      setSuccess(true)
      // Si cambió el idioma, redirigir al nuevo locale para aplicar traducciones
      if (locale !== params.locale) {
        setTimeout(() => router.push(`/${locale}/dashboard/profile`), 800)
      } else {
        setTimeout(() => setSuccess(false), 3000)
        setSaving(false)
      }
    }
  }

  const initials = fullName ? fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??'

  const sexOptions = [
    { key: 'male',   label: t('male') },
    { key: 'female', label: t('female') },
    { key: 'other',  label: t('other') },
  ]
  const languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0e0e0e]">
      <div className="w-6 h-6 border-2 border-[#c8f73a]/30 border-t-[#c8f73a] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0e0e0e] p-6 lg:p-10">
      <div className="max-w-lg">

        <div className="mb-10">
          <p className="font-label text-[10px] uppercase tracking-[0.25em] text-white/30 mb-2">{t('section_my_area')}</p>
          <h1 className="font-headline font-black text-4xl text-white tracking-tight">{t('title')}</h1>
          <p className="text-white/40 text-sm mt-2 font-body">{t('subtitle_client')}</p>
        </div>

        <div className="space-y-8">

          {/* Avatar */}
          <div>
            <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-3">{t('avatar_label')}</label>
            <div className="flex items-center gap-5">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}
                className="relative w-20 h-20 flex-shrink-0 group focus:outline-none" title={t('avatar_click')}>
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full bg-[#c8f73a] flex items-center justify-center text-black font-headline font-black text-2xl">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <span className="material-symbols-outlined text-white text-[22px]">photo_camera</span>
                  }
                </div>
              </button>
              <div>
                <p className="text-white/60 text-sm font-body">{uploadingAvatar ? t('avatar_uploading') : t('avatar_click')}</p>
                <p className="text-white/25 text-[11px] font-label mt-1">{t('avatar_hint')}</p>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Nombre */}
          <div>
            <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-2">{t('name_label')}</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder={t('name_placeholder')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-body placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
          </div>

          {/* Teléfono */}
          <div>
            <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-2">{t('phone_label')}</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder={t('phone_placeholder')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-body placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
            <p className="text-[11px] text-white/30 mt-1.5 font-label">{t('phone_hint_client')}</p>
          </div>

          {/* Género */}
          <div>
            <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-2">{t('gender_label')}</label>
            <div className="flex gap-2">
              {sexOptions.map(opt => (
                <button key={opt.key} type="button" onClick={() => setSex(opt.key as any)}
                  className={`flex-1 py-3 rounded-xl font-label text-xs uppercase tracking-wider transition-all border ${
                    sex === opt.key
                      ? 'bg-[#c8f73a] text-black border-[#c8f73a] font-bold'
                      : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Idioma */}
          <div>
            <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-2">{t('language_label')}</label>
            <div className="flex gap-2">
              {languages.map(lang => (
                <button key={lang.code} type="button" onClick={() => setLocaleVal(lang.code)}
                  className={`flex-1 py-3 rounded-xl font-label text-xs uppercase tracking-wider transition-all border ${
                    locale === lang.code
                      ? 'bg-[#c8f73a] text-black border-[#c8f73a] font-bold'
                      : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                  }`}>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 font-label text-xs">{error}</p>}
          {success && (
            <div className="flex items-center gap-2 text-[#c8f73a] font-label text-xs">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {t('saved')}
            </div>
          )}

          <button onClick={handleSave} disabled={saving || uploadingAvatar}
            className="w-full bg-[#c8f73a] text-black font-headline font-black text-sm py-4 rounded-xl hover:bg-[#d4ff45] transition-colors disabled:opacity-60 tracking-wider uppercase">
            {saving ? t('saving') : t('save')}
          </button>

        </div>
      </div>
    </div>
  )
}
