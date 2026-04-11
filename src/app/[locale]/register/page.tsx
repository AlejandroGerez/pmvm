'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

// ── OAuth SVGs ─────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const AppleIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="white">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
  </svg>
)

const texts = {
  es: {
    title: 'CREAR',
    titleAccent: 'CUENTA.',
    subtitle: 'Registrate para acceder a tu área de cliente.',
    name: 'Nombre completo',
    email: 'Email',
    phone: 'WhatsApp / Teléfono',
    phonePlaceholder: '+54 9 11 1234 5678',
    phoneHint: 'Para recibir confirmaciones y novedades por WhatsApp',
    password: 'Contraseña',
    passwordHint: 'Mínimo 8 caracteres',
    button: 'CREAR CUENTA',
    loading: 'Creando cuenta...',
    successTitle: 'REVISÁ TU',
    successAccent: 'EMAIL.',
    successText: (email: string) =>
      `Te enviamos un link de confirmación a ${email}. Hacé click en el link para activar tu cuenta.`,
    errorGeneric: 'Ocurrió un error. Intentá de nuevo.',
    errorEmail: 'Este email ya está registrado.',
    errorPassword: 'La contraseña debe tener al menos 8 caracteres.',
    hasAccount: '¿Ya tenés cuenta?',
    login: 'Iniciar sesión',
    back: 'Volver al inicio',
  },
  en: {
    title: 'CREATE',
    titleAccent: 'ACCOUNT.',
    subtitle: 'Sign up to access your client area.',
    name: 'Full name',
    email: 'Email',
    phone: 'WhatsApp / Phone',
    phonePlaceholder: '+1 555 123 4567',
    phoneHint: 'To receive confirmations and updates via WhatsApp',
    password: 'Password',
    passwordHint: 'At least 8 characters',
    button: 'CREATE ACCOUNT',
    loading: 'Creating account...',
    successTitle: 'CHECK YOUR',
    successAccent: 'EMAIL.',
    successText: (email: string) =>
      `We sent a confirmation link to ${email}. Click the link to activate your account.`,
    errorGeneric: 'An error occurred. Please try again.',
    errorEmail: 'This email is already registered.',
    errorPassword: 'Password must be at least 8 characters.',
    hasAccount: 'Already have an account?',
    login: 'Sign in',
    back: 'Back to home',
  },
  pt: {
    title: 'CRIAR',
    titleAccent: 'CONTA.',
    subtitle: 'Cadastre-se para acessar sua área de cliente.',
    name: 'Nome completo',
    email: 'Email',
    phone: 'WhatsApp / Telefone',
    phonePlaceholder: '+55 11 91234-5678',
    phoneHint: 'Para receber confirmações e novidades via WhatsApp',
    password: 'Senha',
    passwordHint: 'Mínimo 8 caracteres',
    button: 'CRIAR CONTA',
    loading: 'Criando conta...',
    successTitle: 'VERIFIQUE SEU',
    successAccent: 'EMAIL.',
    successText: (email: string) =>
      `Enviamos um link de confirmação para ${email}. Clique no link para ativar sua conta.`,
    errorGeneric: 'Ocorreu um erro. Tente novamente.',
    errorEmail: 'Este email já está cadastrado.',
    errorPassword: 'A senha deve ter pelo menos 8 caracteres.',
    hasAccount: 'Já tem uma conta?',
    login: 'Entrar',
    back: 'Voltar ao início',
  },
}

export default function RegisterPage({ params }: { params: { locale: string } }) {
  const t = texts[params.locale as keyof typeof texts] ?? texts.es

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?type=oauth`,
      },
    })
    setOauthLoading(null)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError(t.errorPassword)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone.trim() || null },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${params.locale}/auth/confirm`,
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        setError(t.errorEmail)
      } else {
        setError(t.errorGeneric)
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/2 w-[500px] h-[500px] bg-[#c1ed00]/[0.04] blur-[160px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[#ff734a]/[0.03] blur-[140px] rounded-full translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <p className="text-xs font-black tracking-[0.3em] text-[#c1ed00] mb-4">R3SET</p>

          {success ? (
            <>
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-[#c1ed00]/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-[#c1ed00]" />
                </div>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white leading-none">
                {t.successTitle}<br />
                <span className="text-[#c1ed00] italic">{t.successAccent}</span>
              </h1>
            </>
          ) : (
            <h1 className="text-5xl font-black tracking-tighter text-white leading-none">
              {t.title}<br />
              <span className="text-[#c1ed00] italic">{t.titleAccent}</span>
            </h1>
          )}

          <p className="text-white/40 text-sm mt-3">
            {success ? t.successText(email) : t.subtitle}
          </p>
        </div>

        {success ? (
          /* Success — link to login */
          <div className="text-center">
            <Link
              href={`/${params.locale}/login`}
              className="inline-block px-8 py-3.5 bg-[#c1ed00] text-[#0e0e0e] font-black text-sm tracking-widest rounded-xl hover:bg-[#d4ff00] transition-colors"
            >
              IR A INICIAR SESIÓN
            </Link>
          </div>
        ) : (
          /* Form */
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">
                  {t.name}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#c1ed00]/50 transition-colors"
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#c1ed00]/50 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">
                  {t.phone}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#c1ed00]/50 transition-colors"
                  placeholder={t.phonePlaceholder}
                />
                <p className="text-white/20 text-xs mt-1.5 px-1">{t.phoneHint}</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">
                  {t.password}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#c1ed00]/50 transition-colors"
                  placeholder="••••••••"
                />
                <p className="text-white/20 text-xs mt-1.5 px-1">{t.passwordHint}</p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c1ed00] text-[#0e0e0e] font-black py-3.5 rounded-xl hover:bg-[#d4ff00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-widest mt-1"
              >
                {loading ? t.loading : t.button}
              </button>
            </form>

            {/* OAuth divider */}
            <div className="flex items-center gap-3 mt-2 mb-4">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-[10px] text-white/20 uppercase tracking-widest">o registrate con</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={!!oauthLoading}
                className="flex items-center justify-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold hover:bg-white/[0.09] hover:border-white/20 transition-all disabled:opacity-50"
              >
                {oauthLoading === 'google'
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <GoogleIcon />}
                Google
              </button>
              {process.env.NEXT_PUBLIC_APPLE_AUTH_ENABLED === 'true' && (
                <button
                  type="button"
                  onClick={() => handleOAuth('apple')}
                  disabled={!!oauthLoading}
                  className="flex items-center justify-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold hover:bg-white/[0.09] hover:border-white/20 transition-all disabled:opacity-50"
                >
                  {oauthLoading === 'apple'
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <AppleIcon />}
                  Apple
                </button>
              )}
            </div>

            {/* Login link */}
            <p className="text-center text-white/40 text-sm mt-5">
              {t.hasAccount}{' '}
              <Link href={`/${params.locale}/login`} className="text-[#c1ed00] font-bold hover:underline">
                {t.login}
              </Link>
            </p>
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-8">
          <Link
            href={`/${params.locale}`}
            className="text-white/25 text-sm hover:text-white/50 transition-colors"
          >
            ← {t.back}
          </Link>
        </div>
      </div>
    </div>
  )
}
