'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { CheckCircle2, Lock, Sparkles, X } from 'lucide-react'

/* ── Plan catalog (matches API route + Supabase) ── */
const PLANS = {
  monthly: {
    id: 'monthly',
    name: { es: 'Mensual', en: 'Monthly', pt: 'Mensal' },
    price: 100,
    isRecurring: false,
    period: { es: '1 mes de acceso', en: '1 month of access', pt: '1 mês de acesso' },
    frequency: { es: 'Pago único · no se renueva automáticamente', en: 'One-time payment · does not auto-renew', pt: 'Pagamento único · não renova automaticamente' },
    features: {
      es: ['Rutina de entrenamiento personalizada', 'Videos demostrativos de ejercicios', 'Guía alimentaria + lista de compras', 'App exclusiva (Android + iOS)', 'Soporte por la app'],
      en: ['Personalized training routine', 'Exercise demo videos', 'Food guide + shopping list', 'Exclusive app (Android + iOS)', 'In-app support'],
      pt: ['Rotina de treino personalizada', 'Vídeos demonstrativos', 'Guia alimentar + lista de compras', 'App exclusivo (Android + iOS)', 'Suporte pelo app'],
    },
  },
  quarterly: {
    id: 'quarterly',
    name: { es: 'Trimestral', en: 'Quarterly', pt: 'Trimestral' },
    price: 150,
    isRecurring: false,
    period: { es: '3 meses de acceso', en: '3 months of access', pt: '3 meses de acesso' },
    frequency: { es: 'Pago único · no se renueva automáticamente', en: 'One-time payment · does not auto-renew', pt: 'Pagamento único · não renova automaticamente' },
    features: {
      es: ['Todo lo del plan Mensual', 'Seguimiento semanal personalizado', 'Ajustes continuos de rutina', 'Prioridad de soporte'],
      en: ['Everything in Monthly', 'Personalized weekly follow-up', 'Continuous routine adjustments', 'Priority support'],
      pt: ['Tudo do plano Mensal', 'Acompanhamento semanal', 'Ajustes contínuos de rotina', 'Suporte prioritário'],
    },
  },
  semiannual: {
    id: 'semiannual',
    name: { es: 'Semestral', en: 'Semi-annual', pt: 'Semestral' },
    price: 200,
    isRecurring: false,
    period: { es: '6 meses de acceso', en: '6 months of access', pt: '6 meses de acesso' },
    frequency: { es: 'Pago único · no se renueva automáticamente', en: 'One-time payment · does not auto-renew', pt: 'Pagamento único · não renova automaticamente' },
    features: {
      es: ['Todo lo del plan Trimestral', 'Plan nutricional completo', 'Comunidad privada WhatsApp', 'Mejor valor por mes'],
      en: ['Everything in Quarterly', 'Complete nutrition plan', 'Private WhatsApp community', 'Best value per month'],
      pt: ['Tudo do plano Trimestral', 'Plano nutricional completo', 'Comunidade privada WhatsApp', 'Melhor custo-benefício'],
    },
  },
  mentoria: {
    id: 'mentoria',
    name: { es: 'Mentoría 1-1', en: 'Mentorship 1-1', pt: 'Mentoria 1-1' },
    price: 300,
    isRecurring: true,
    period: { es: 'por mes', en: 'per month', pt: 'por mês' },
    frequency: { es: 'Suscripción mensual · cancelable en cualquier momento', en: 'Monthly subscription · cancel anytime', pt: 'Assinatura mensal · cancele quando quiser' },
    features: {
      es: ['Rutina 100% personalizada a tu biotipo', 'Chat directo con el coach', 'Videollamadas quincenales de ajuste', 'Estrategia de largo plazo', 'Cupos limitados — requiere entrevista previa'],
      en: ['100% personalized routine for your body type', 'Direct chat with coach', 'Bi-weekly video adjustment calls', 'Long-term strategy', 'Limited spots — requires prior interview'],
      pt: ['Rotina 100% personalizada ao seu biotipo', 'Chat direto com o coach', 'Videochamadas quinzenais de ajuste', 'Estratégia de longo prazo', 'Vagas limitadas — requer entrevista prévia'],
    },
  },
} as const

const DISPLAY_PRICES: Record<string, { monthly: string; total: string | null; savings: string | null }> = {
  monthly:    { monthly: '$44.999', total: null,       savings: null },
  quarterly:  { monthly: '$39.999', total: '$119.999', savings: '11% off' },
  semiannual: { monthly: '$36.666', total: '$219.999', savings: '18% off' },
  mentoria:   { monthly: 'A consultar', total: null,   savings: null },
}

const PICKER_PLANS = ['monthly', 'quarterly', 'semiannual'] as const

type PlanId = keyof typeof PLANS
type Locale = 'es' | 'en' | 'pt'

/* ── i18n for checkout page ── */
const i18n = {
  es: {
    header_sub: 'Checkout',
    header_title: 'COMPLETÁ TU SUSCRIPCIÓN',
    plan_label: 'Tu plan',
    change_plan: 'Cambiar plan',
    subtotal: 'Subtotal',
    total: 'Total',
    recurring_note: 'Se renueva automáticamente. Podés cancelar en cualquier momento.',
    section_account: 'Tus datos',
    section_account_logged: 'Tu cuenta',
    logged_as: 'Logueado como',
    not_you: '¿No sos vos?',
    have_account: '¿Ya tenés cuenta?',
    sign_in: 'Iniciá sesión',
    no_account: '¿No tenés cuenta?',
    create_account: 'Registrate',
    name_label: 'Nombre completo',
    name_placeholder: 'Tu nombre',
    email_label: 'Email',
    email_placeholder: 'tu@email.com',
    phone_label: 'WhatsApp / Teléfono',
    phone_placeholder: '+54 9 11 1234-5678',
    password_label: 'Contraseña',
    password_placeholder: 'Mínimo 8 caracteres',
    login_email_label: 'Email',
    login_pass_label: 'Contraseña',
    terms: 'He leído y acepto los',
    terms_link: 'términos y condiciones',
    cta_subscribe: 'Suscribirme →',
    cta_processing: 'Procesando...',
    secure_note: 'Pago seguro con Mercado Pago. Tus datos están protegidos.',
    error_required: 'Completá todos los campos obligatorios',
    error_password: 'La contraseña debe tener al menos 8 caracteres',
    error_terms: 'Aceptá los términos y condiciones',
    error_login: 'Email o contraseña incorrectos',
    error_user_exists: 'Ya tenés una cuenta con ese email. Ingresá tu contraseña para continuar.',
  },
  en: {
    header_sub: 'Checkout',
    header_title: 'COMPLETE YOUR SUBSCRIPTION',
    plan_label: 'Your plan',
    change_plan: 'Change plan',
    subtotal: 'Subtotal',
    total: 'Total',
    recurring_note: 'Renews automatically. Cancel anytime.',
    section_account: 'Your details',
    section_account_logged: 'Your account',
    logged_as: 'Signed in as',
    not_you: 'Not you?',
    have_account: 'Already have an account?',
    sign_in: 'Sign in',
    no_account: "Don't have an account?",
    create_account: 'Create one',
    name_label: 'Full name',
    name_placeholder: 'Your name',
    email_label: 'Email',
    email_placeholder: 'you@email.com',
    phone_label: 'WhatsApp / Phone',
    phone_placeholder: '+1 555 123 4567',
    password_label: 'Password',
    password_placeholder: 'At least 8 characters',
    login_email_label: 'Email',
    login_pass_label: 'Password',
    terms: "I've read and accept the",
    terms_link: 'terms and conditions',
    cta_subscribe: 'Subscribe →',
    cta_processing: 'Processing...',
    secure_note: 'Secure payment with Mercado Pago. Your data is protected.',
    error_required: 'Please fill in all required fields',
    error_password: 'Password must be at least 8 characters',
    error_terms: 'Please accept the terms and conditions',
    error_login: 'Wrong email or password',
    error_user_exists: 'An account with that email already exists. Enter your password to continue.',
  },
  pt: {
    header_sub: 'Checkout',
    header_title: 'COMPLETE SUA ASSINATURA',
    plan_label: 'Seu plano',
    change_plan: 'Mudar plano',
    subtotal: 'Subtotal',
    total: 'Total',
    recurring_note: 'Renova automaticamente. Cancele quando quiser.',
    section_account: 'Seus dados',
    section_account_logged: 'Sua conta',
    logged_as: 'Conectado como',
    not_you: 'Não é você?',
    have_account: 'Já tem conta?',
    sign_in: 'Entrar',
    no_account: 'Não tem conta?',
    create_account: 'Crie uma',
    name_label: 'Nome completo',
    name_placeholder: 'Seu nome',
    email_label: 'Email',
    email_placeholder: 'voce@email.com',
    phone_label: 'WhatsApp / Telefone',
    phone_placeholder: '+55 11 91234-5678',
    password_label: 'Senha',
    password_placeholder: 'Mínimo 8 caracteres',
    login_email_label: 'Email',
    login_pass_label: 'Senha',
    terms: 'Li e aceito os',
    terms_link: 'termos e condições',
    cta_subscribe: 'Assinar →',
    cta_processing: 'Processando...',
    secure_note: 'Pagamento seguro com Mercado Pago. Seus dados estão protegidos.',
    error_required: 'Preencha todos os campos obrigatórios',
    error_password: 'A senha deve ter pelo menos 8 caracteres',
    error_terms: 'Aceite os termos e condições',
    error_login: 'Email ou senha incorretos',
    error_user_exists: 'Já existe uma conta com esse email. Digite sua senha para continuar.',
  },
}

export default function CheckoutPage({ params }: { params: { locale: string } }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const locale = (params.locale as Locale) || 'es'
  const t = i18n[locale] ?? i18n.es

  // Plan from URL or default to monthly
  const planParam = searchParams.get('plan') as PlanId | null
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(
    planParam && PLANS[planParam] ? planParam : 'monthly'
  )

  // Auth state
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [mode, setMode] = useState<'register' | 'login'>('register')

  // Form fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phonePrefix, setPhonePrefix] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  // State
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPlanPicker, setShowPlanPicker] = useState(false)
  const planPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (planPickerRef.current && !planPickerRef.current.contains(e.target as Node)) {
        setShowPlanPicker(false)
      }
    }
    if (showPlanPicker) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPlanPicker])
  const [showTerms, setShowTerms] = useState(false)

  // Check existing session
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        setEmail(user.email ?? '')
        // fetch name from profile
        supabase.from('profiles').select('full_name, phone').eq('id', user.id).single()
          .then(({ data }) => {
            if (data?.full_name) setFullName(data.full_name)
            if (data?.phone) setPhone(data.phone)
          })
      }
      setAuthLoading(false)
    })
  }, [supabase])

  const plan = PLANS[selectedPlan]

  const handleSubmit = async () => {
    setError(null)

    if (!acceptTerms) { setError(t.error_terms); return }

    if (!user) {
      if (mode === 'register') {
        if (!fullName.trim() || !email.trim() || !password) { setError(t.error_required); return }
        if (password.length < 8) { setError(t.error_password); return }
      } else {
        if (!email.trim() || !password) { setError(t.error_required); return }
      }
    }

    setSubmitting(true)

    try {
      let authenticatedUser = user

      // ── Login mode: sign in first, then subscribe ──
      if (!user && mode === 'login') {
        const { data: signInData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError || !signInData.user) {
          setError(t.error_login)
          setSubmitting(false)
          return
        }
        authenticatedUser = signInData.user
        setUser(signInData.user)
        // After signing in, call API without credentials (session cookie is now set)
        const res = await fetch('/api/mp/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: selectedPlan, locale }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Error inesperado'); setSubmitting(false); return }
        const redirectUrl = data.initPoint || data.sandboxInitPoint
        if (redirectUrl) { window.location.href = redirectUrl; return }
        setError('No se pudo obtener el enlace de pago')
        setSubmitting(false)
        return
      }

      // ── Already authenticated: subscribe directly ──
      if (authenticatedUser) {
        const res = await fetch('/api/mp/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: selectedPlan, locale }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Error inesperado'); setSubmitting(false); return }
        const redirectUrl = data.initPoint || data.sandboxInitPoint
        if (redirectUrl) { window.location.href = redirectUrl; return }
        setError('No se pudo obtener el enlace de pago')
        setSubmitting(false)
        return
      }

      // ── Register mode: create account + subscribe ──
      const res = await fetch('/api/mp/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan, locale, email, password, fullName, phone }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'USER_EXISTS') {
          // Account already exists — switch to login mode clearly
          setPassword('')
          setMode('login')
          setError(t.error_user_exists)
        } else {
          setError(data.error ?? 'Error inesperado')
        }
        setSubmitting(false)
        return
      }

      // New user created — sign them in client-side so session is established
      if (data.isNewUser) {
        await supabase.auth.signInWithPassword({ email, password })
      }

      // Redirect to MercadoPago
      const redirectUrl = data.initPoint || data.sandboxInitPoint
      if (redirectUrl) {
        window.location.href = redirectUrl
      } else {
        setError('No se pudo obtener el enlace de pago')
        setSubmitting(false)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Error de conexión. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setFullName('')
    setEmail('')
    setPhone('')
    setMode('register')
  }

  if (authLoading) return (
    <div className="bg-[#0e0e0e] min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#c8f73a]/30 border-t-[#c8f73a] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white">
      {/* Ambient */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#c1ed00]/5 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#00e3fd]/4 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 lg:py-16">

        {/* Top bar */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <Link href={`/${locale}/v4secret#pricing`} className="flex items-center gap-1 text-white/40 text-[11px] uppercase tracking-widest hover:text-white transition-colors mb-3">
              ← Volver a planes
            </Link>
            <Link href={`/${locale}`}>
              <span className="text-xl font-black text-[#c1ed00] font-headline tracking-[-0.04em] uppercase italic">
                R3SET
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Lock size={13} className="text-white/30 flex-shrink-0" />
            <span className="text-white/30 text-[11px]">Pago seguro con Mercado Pago</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[13px] font-black uppercase tracking-[0.25em] text-[#c1ed00] mb-2">CHECKOUT</p>
          <h1 className="font-headline font-black text-3xl lg:text-4xl tracking-tight uppercase">COMPLETÁ TU SUSCRIPCIÓN</h1>
          <p className="text-white/40 text-base mt-3">Estás a un paso de comenzar tu transformación.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-8">

              {/* Section title */}
              <h2 className="font-headline font-bold text-lg uppercase tracking-tight mb-6">
                <span className="text-[#c1ed00]">1.</span> Tus datos
              </h2>

              {user ? (
                /* ── Logged in ── */
                <div className="mb-6">
                  <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{t.logged_as}</p>
                      <p className="text-white font-bold">{fullName || user.email}</p>
                      <p className="text-white/40 text-sm">{user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                      {t.not_you}
                    </button>
                  </div>
                </div>
              ) : mode === 'register' ? (
                /* ── Registration form ── */
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">{t.name_label} *</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Tu nombre completo"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
                  </div>
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">{t.email_label} *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder={t.email_placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 w-20">
                      <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">Cod. País</label>
                      <input
                        type="text"
                        value={phonePrefix}
                        onChange={e => { setPhonePrefix(e.target.value); setPhone(`${e.target.value} ${phoneNumber}`.trim()) }}
                        placeholder="+54"
                        maxLength={6}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all text-center text-sm font-label"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">WhatsApp / Teléfono</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={e => { setPhoneNumber(e.target.value); setPhone(`${phonePrefix} ${e.target.value}`.trim()) }}
                        placeholder="11 1234 5678"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">{t.password_label} *</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder={t.password_placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
                  </div>
                  <p className="text-white/30 text-[11px]">
                    {t.have_account}{' '}
                    <button onClick={() => setMode('login')} className="text-[#c8f73a] hover:underline">{t.sign_in}</button>
                  </p>
                </div>
              ) : (
                /* ── Login form ── */
                <div className="space-y-4 mb-6">
                  <div className="bg-[#c8f73a]/5 border border-[#c8f73a]/20 rounded-xl px-4 py-3 text-[12px] text-[#c8f73a]/80">
                    {locale === 'en' ? '👋 Sign in to your existing account to continue.' : locale === 'pt' ? '👋 Entre na sua conta existente para continuar.' : '👋 Ingresá a tu cuenta existente para continuar.'}
                  </div>
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">{t.login_email_label} *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder={t.email_placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
                  </div>
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">{t.login_pass_label} *</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder={t.password_placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-white/30 text-[11px]">
                      {t.no_account}{' '}
                      <button onClick={() => { setMode('register'); setPassword('') }} className="text-[#c8f73a] hover:underline">{t.create_account}</button>
                    </p>
                    <a href={`/${locale}/reset-password`} className="text-white/30 text-[11px] hover:text-white/50 transition-colors">
                      {locale === 'en' ? 'Forgot password?' : locale === 'pt' ? 'Esqueceu a senha?' : '¿Olvidaste la contraseña?'}
                    </a>
                  </div>
                </div>
              )}

              {/* Mentoría upsell */}
              <div className="border border-[#c1ed00]/30 bg-[#c1ed00]/5 rounded-xl p-6 mt-auto mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#c1ed00]/15 border border-[#c1ed00]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles size={18} className="text-[#c1ed00]" />
                  </div>
                  <div>
                    <p className="font-headline font-black text-sm uppercase tracking-tight text-[#c1ed00] mb-2">
                      ¿Buscás un acompañamiento más personalizado?
                    </p>
                    <p className="text-white/50 text-sm leading-relaxed mb-1">
                      Solicitá una evaluación para la Mentoría 1 a 1<br />con Ale Gerez.
                    </p>
                    <p className="text-white/30 text-xs mb-4">Cupos limitados.</p>
                    <Link href={`/${locale}/v4secret#pricing`} className="text-[#c1ed00] text-sm font-bold hover:underline">
                      Solicitar evaluación →
                    </Link>
                  </div>
                </div>
              </div>

              {/* T&C */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 accent-[#c8f73a]" />
                <span className="text-white/50 text-sm leading-tight">
                  {t.terms}{' '}
                  <button type="button" onClick={() => setShowTerms(true)} className="text-[#c8f73a] hover:underline">
                    {t.terms_link}
                  </button>
                </span>
              </label>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[#c8f73a] text-black font-headline font-black text-base py-4 rounded-xl hover:bg-[#d4ff45] transition-all disabled:opacity-60 tracking-wider uppercase active:scale-[0.98]"
              >
                {submitting ? t.cta_processing : 'CONTINUAR AL PAGO →'}
              </button>

              {/* Secure note */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <Lock size={13} className="text-white/20 flex-shrink-0" />
                <p className="text-white/25 text-[11px]">Tus datos están protegidos. Proceso 100% seguro.</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Plan summary ── */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-8 lg:sticky lg:top-8">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline font-bold text-lg uppercase tracking-tight">
                  <span className="text-[#c1ed00]">2.</span> Tu plan
                </h2>
                {/* Change plan button with border */}
                <div className="relative" ref={planPickerRef}>
                  <button
                    onClick={() => setShowPlanPicker(!showPlanPicker)}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#c8f73a] border border-[#c8f73a]/40 rounded-lg px-3 py-1.5 hover:border-[#c8f73a]/70 transition-colors"
                  >
                    Cambiar plan <span className="text-[10px]">{showPlanPicker ? '▴' : '▾'}</span>
                  </button>

                  {/* Floating dropdown */}
                  <div className={`absolute right-0 top-full mt-2 w-72 bg-[#1a1a1a] border border-white/15 rounded-xl z-50 overflow-hidden transition-all duration-200 shadow-[0_16px_40px_rgba(0,0,0,0.7)] ring-1 ring-[#c1ed00]/10 ${
                    showPlanPicker ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}>
                    {PICKER_PLANS.map(id => {
                      const p = PLANS[id]
                      const dp = DISPLAY_PRICES[id]
                      const isActive = id === selectedPlan
                      return (
                        <button key={id}
                          onClick={() => { setSelectedPlan(id); setShowPlanPicker(false) }}
                          className={`w-full flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 transition-colors text-left gap-3 ${
                            isActive ? 'bg-[#c8f73a]/10' : 'hover:bg-white/5'
                          }`}>
                          <span className={`font-headline font-bold text-sm uppercase ${isActive ? 'text-[#c8f73a]' : 'text-white/60'}`}>
                            {p.name[locale]}
                          </span>
                          <div className="text-right flex-shrink-0">
                            <span className={`font-headline font-black text-sm leading-none ${isActive ? 'text-white' : 'text-white/60'}`}>
                              {dp.monthly}/mes
                            </span>
                            {dp.total && (
                              <span className="text-white/30 text-[10px] ml-1.5">· {dp.total}</span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Selected plan card */}
              <div className="bg-[#c8f73a]/5 border border-[#c8f73a]/20 rounded-xl p-5 mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#c8f73a] mb-2">
                  Plan {plan.name[locale]}
                </p>
                <p className="font-headline font-black text-3xl text-white">
                  {DISPLAY_PRICES[selectedPlan].monthly}
                  <span className="text-white/40 text-base font-normal font-body ml-1">/mes</span>
                </p>
                {DISPLAY_PRICES[selectedPlan].total && (
                  <p className="text-white/30 text-[11px] mt-1.5">
                    Total {DISPLAY_PRICES[selectedPlan].total} · {DISPLAY_PRICES[selectedPlan].savings}
                  </p>
                )}
                <p className="text-white/25 text-[11px] mt-2">Suscripción mensual · Renovación automática</p>
              </div>

              {/* Features — exact items from Plan Base */}
              <div className="space-y-2.5 mb-2">
                {[
                  'Rutina personalizada (gimnasio - hogar)',
                  'App exclusiva Android e iPhone',
                  'Videos explicativos de cada ejercicio',
                  'Seguimiento semanal',
                  'Soporte en plataforma',
                  'Comunidad privada de alumnos',
                  'Cancelá en cualquier momento',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[#c8f73a] mt-0.5 flex-shrink-0" />
                    <p className="text-white/70 text-sm">{feat}</p>
                  </div>
                ))}
              </div>

              {/* Additional benefits */}
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-4 mb-3">Complementá tu proceso con:</p>
                <div className="space-y-2.5">
                  {[
                    'Consultas nutricionales con profesionales especializados',
                    'Acompañamiento psicológico para fortalecer hábitos y emociones',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-[#c8f73a] mt-0.5 flex-shrink-0" />
                      <p className="text-white/70 text-sm">{feat}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Método de pago */}
              <div className="border border-white/10 rounded-xl p-4 mb-6">
                <p className="font-headline font-bold text-base uppercase tracking-tight mb-3">
                  <span className="text-[#c1ed00]">3.</span> Método de pago
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00b1ea] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-[9px] leading-none text-center">MP</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Mercado Pago</p>
                    <p className="text-white/40 text-xs mt-0.5">Pagar con tarjeta, débito o dinero en cuenta.</p>
                  </div>
                </div>
              </div>

              {/* Resumen de compra */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Resumen de compra</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40 text-sm">{t.subtotal}</span>
                    <span className="text-white/60 text-sm">{DISPLAY_PRICES[selectedPlan].monthly}/mes</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-white font-bold">{t.total}</span>
                    <span className="text-white font-headline font-black text-xl">
                      {DISPLAY_PRICES[selectedPlan].total ?? DISPLAY_PRICES[selectedPlan].monthly}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ── Terms & Conditions Modal ── */}
      {showTerms && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowTerms(false) }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-[#141414] border border-white/10 rounded-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-headline font-black text-lg uppercase tracking-tight">
                {locale === 'en' ? 'Terms & Conditions' : locale === 'pt' ? 'Termos e Condições' : 'Términos y Condiciones'}
              </h2>
              <button onClick={() => setShowTerms(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            {/* Body */}
            <div className="overflow-y-auto p-6 text-white/60 text-sm leading-relaxed space-y-4">
              <p className="text-white/30 text-[11px] uppercase tracking-widest">
                {locale === 'en' ? 'Last updated: April 2026' : locale === 'pt' ? 'Última atualização: Abril 2026' : 'Última actualización: Abril 2026'}
              </p>

              <section>
                <h3 className="text-white font-bold mb-2">
                  {locale === 'en' ? '1. Service' : locale === 'pt' ? '1. Serviço' : '1. Servicio'}
                </h3>
                <p>
                  {locale === 'en'
                    ? 'MÉTODO R3SET provides personalized fitness coaching, nutrition guidance, and health tracking services through its web platform and mobile app. By subscribing, you gain access to the features included in your chosen plan.'
                    : locale === 'pt'
                    ? 'O MÉTODO R3SET oferece serviços de coaching fitness personalizado, orientação nutricional e acompanhamento de saúde através da sua plataforma web e app mobile. Ao assinar, você tem acesso às funcionalidades incluídas no plano escolhido.'
                    : 'MÉTODO R3SET brinda servicios de coaching fitness personalizado, orientación nutricional y seguimiento de salud a través de su plataforma web y app mobile. Al suscribirte, accedés a las funcionalidades incluidas en el plan elegido.'}
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold mb-2">
                  {locale === 'en' ? '2. Subscription & Billing' : locale === 'pt' ? '2. Assinatura e Cobrança' : '2. Suscripción y Facturación'}
                </h3>
                <p>
                  {locale === 'en'
                    ? 'Your subscription renews automatically at the end of each billing period. You can cancel at any time through Mercado Pago before the next renewal date. No refunds are issued for partial periods.'
                    : locale === 'pt'
                    ? 'Sua assinatura é renovada automaticamente ao final de cada período de cobrança. Você pode cancelar a qualquer momento pelo Mercado Pago antes da data de renovação. Não são emitidos reembolsos por períodos parciais.'
                    : 'Tu suscripción se renueva automáticamente al finalizar cada período de facturación. Podés cancelar en cualquier momento a través de Mercado Pago antes de la próxima renovación. No se emiten reembolsos por períodos parciales.'}
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold mb-2">
                  {locale === 'en' ? '3. Account' : locale === 'pt' ? '3. Conta' : '3. Cuenta'}
                </h3>
                <p>
                  {locale === 'en'
                    ? 'You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to subscribe. One account per person.'
                    : locale === 'pt'
                    ? 'Você é responsável por manter a confidencialidade das credenciais da sua conta. Você deve ter pelo menos 18 anos para assinar. Uma conta por pessoa.'
                    : 'Sos responsable de mantener la confidencialidad de tus credenciales. Debés tener al menos 18 años para suscribirte. Una cuenta por persona.'}
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold mb-2">
                  {locale === 'en' ? '4. Health Disclaimer' : locale === 'pt' ? '4. Aviso de Saúde' : '4. Aviso de Salud'}
                </h3>
                <p>
                  {locale === 'en'
                    ? 'The content provided is for general fitness and wellness purposes only and does not constitute medical advice. Consult a healthcare professional before starting any exercise or nutrition program.'
                    : locale === 'pt'
                    ? 'O conteúdo fornecido é apenas para fins gerais de fitness e bem-estar e não constitui aconselhamento médico. Consulte um profissional de saúde antes de iniciar qualquer programa de exercícios ou nutrição.'
                    : 'El contenido provisto es solo para fines generales de fitness y bienestar y no constituye asesoramiento médico. Consultá un profesional de la salud antes de comenzar cualquier programa de ejercicio o nutrición.'}
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold mb-2">
                  {locale === 'en' ? '5. Privacy' : locale === 'pt' ? '5. Privacidade' : '5. Privacidad'}
                </h3>
                <p>
                  {locale === 'en'
                    ? 'Your personal data is processed in accordance with our Privacy Policy. We do not sell your data to third parties. Payment processing is handled securely by Mercado Pago.'
                    : locale === 'pt'
                    ? 'Seus dados pessoais são processados de acordo com nossa Política de Privacidade. Não vendemos seus dados a terceiros. O processamento de pagamentos é feito com segurança pelo Mercado Pago.'
                    : 'Tus datos personales son procesados conforme a nuestra Política de Privacidad. No vendemos tus datos a terceros. El procesamiento de pagos es gestionado de forma segura por Mercado Pago.'}
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold mb-2">
                  {locale === 'en' ? '6. Changes' : locale === 'pt' ? '6. Alterações' : '6. Cambios'}
                </h3>
                <p>
                  {locale === 'en'
                    ? 'We reserve the right to update these terms. Continued use of the service after changes constitutes acceptance of the updated terms.'
                    : locale === 'pt'
                    ? 'Reservamo-nos o direito de atualizar estes termos. O uso continuado do serviço após as alterações constitui aceitação dos termos atualizados.'
                    : 'Nos reservamos el derecho de actualizar estos términos. El uso continuado del servicio después de los cambios constituye la aceptación de los términos actualizados.'}
                </p>
              </section>
            </div>
            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={() => { setAcceptTerms(true); setShowTerms(false) }}
                className="flex-1 bg-[#c8f73a] text-black font-headline font-black text-sm py-3 rounded-xl uppercase tracking-wider hover:bg-[#d4ff45] transition-all"
              >
                {locale === 'en' ? 'Accept & Close' : locale === 'pt' ? 'Aceitar e Fechar' : 'Aceptar y Cerrar'}
              </button>
              <button
                onClick={() => setShowTerms(false)}
                className="px-6 border border-white/10 text-white/50 text-sm rounded-xl hover:border-white/20 hover:text-white/70 transition-all"
              >
                {locale === 'en' ? 'Close' : locale === 'pt' ? 'Fechar' : 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
