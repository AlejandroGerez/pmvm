'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { CheckCircle2, Lock, X } from 'lucide-react'

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
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  // State
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPlanPicker, setShowPlanPicker] = useState(false)
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

        {/* Header */}
        <div className="text-center mb-12">
          <Link href={`/${locale}`}>
            <span className="text-xl font-black text-[#c1ed00] font-headline tracking-[-0.04em] uppercase italic">
              METODO R3SET
            </span>
          </Link>
          <p className="text-white/30 text-[10px] uppercase tracking-[0.25em] mt-2">{t.header_sub}</p>
          <h1 className="font-headline font-black text-3xl lg:text-4xl tracking-tight mt-3">{t.header_title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-8">

              {/* Section title */}
              <h2 className="font-headline font-bold text-lg uppercase tracking-tight mb-6">
                {user ? t.section_account_logged : t.section_account}
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
                      placeholder={t.name_placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
                  </div>
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">{t.email_label} *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder={t.email_placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
                  </div>
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">{t.phone_label}</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder={t.phone_placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
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
                {submitting ? t.cta_processing : t.cta_subscribe}
              </button>

              {/* Secure note */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <Lock size={13} className="text-white/20 flex-shrink-0" />
                <p className="text-white/25 text-[11px]">{t.secure_note}</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Plan summary ── */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-8 lg:sticky lg:top-8">

              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline font-bold text-lg uppercase tracking-tight">{t.plan_label}</h2>
                <button onClick={() => setShowPlanPicker(!showPlanPicker)}
                  className="text-[10px] uppercase tracking-widest text-[#c8f73a] hover:underline">
                  {t.change_plan}
                </button>
              </div>

              {/* Plan picker (collapsible) */}
              {showPlanPicker && (
                <div className="mb-6 space-y-2">
                  {(Object.keys(PLANS) as PlanId[]).map(id => {
                    const p = PLANS[id]
                    const isActive = id === selectedPlan
                    return (
                      <button key={id} onClick={() => { setSelectedPlan(id); setShowPlanPicker(false) }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isActive
                            ? 'border-[#c8f73a] bg-[#c8f73a]/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}>
                        <span className={`font-headline font-bold text-sm uppercase ${isActive ? 'text-[#c8f73a]' : 'text-white/60'}`}>
                          {p.name[locale]}
                        </span>
                        <span className={`font-headline font-black text-sm ${isActive ? 'text-white' : 'text-white/40'}`}>
                          ${p.price.toLocaleString('es-AR')}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Selected plan card */}
              <div className={`border rounded-xl p-5 mb-6 ${plan.isRecurring ? 'bg-[#00e3fd]/5 border-[#00e3fd]/20' : 'bg-[#c8f73a]/5 border-[#c8f73a]/20'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${plan.isRecurring ? 'text-[#00e3fd]' : 'text-[#c8f73a]'}`}>
                      Plan {plan.name[locale]}
                    </p>
                    <p className="font-headline font-black text-3xl text-white">
                      ${plan.price.toLocaleString('es-AR')}
                    </p>
                    <p className="text-white/40 text-sm mt-0.5">{plan.period[locale]}</p>
                  </div>
                  <div className={`text-black text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${plan.isRecurring ? 'bg-[#00e3fd]' : 'bg-[#c8f73a]'}`}>
                    {plan.isRecurring
                      ? (locale === 'en' ? 'MONTHLY' : locale === 'pt' ? 'MENSAL' : 'MENSUAL')
                      : (locale === 'en' ? 'ONE-TIME' : locale === 'pt' ? 'ÚNICO' : 'ÚNICO')}
                  </div>
                </div>
                <p className="text-white/30 text-[11px]">{plan.frequency[locale]}</p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {plan.features[locale].map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[#c8f73a] mt-0.5 flex-shrink-0" />
                    <p className="text-white/60 text-sm">{feat}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/40 text-sm">{t.subtotal}</span>
                  <span className="text-white/60 text-sm">${plan.price.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white font-bold">{t.total}</span>
                  <span className="text-white font-headline font-black text-xl">${plan.price.toLocaleString('es-AR')}</span>
                </div>
                <p className="text-white/25 text-[11px] pt-2">{t.recurring_note}</p>
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
