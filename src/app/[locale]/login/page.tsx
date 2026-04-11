'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { redirect?: string }
}) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)

  const texts = {
    es: {
      title: 'BIENVENIDO',
      titleAccent: 'DE VUELTA.',
      subtitle: 'Ingresá a tu área de cliente',
      email: 'Email',
      password: 'Contraseña',
      button: 'INGRESAR',
      loading: 'Ingresando...',
      errorInvalid: 'Email o contraseña incorrectos.',
      errorGeneric: 'Ocurrió un error. Intentá de nuevo.',
      back: 'Volver al inicio',
      noAccount: '¿No tenés cuenta?',
      register: 'Registrarse',
      orWith: 'o continuá con',
      continueGoogle: 'Continuar con Google',
      continueApple: 'Continuar con Apple',
    },
    en: {
      title: 'WELCOME',
      titleAccent: 'BACK.',
      subtitle: 'Sign in to your client area',
      email: 'Email',
      password: 'Password',
      button: 'SIGN IN',
      loading: 'Signing in...',
      errorInvalid: 'Invalid email or password.',
      errorGeneric: 'An error occurred. Please try again.',
      back: 'Back to home',
      noAccount: "Don't have an account?",
      register: 'Sign up',
      orWith: 'or continue with',
      continueGoogle: 'Continue with Google',
      continueApple: 'Continue with Apple',
    },
    pt: {
      title: 'BEM-VINDO',
      titleAccent: 'DE VOLTA.',
      subtitle: 'Acesse sua área de cliente',
      email: 'Email',
      password: 'Senha',
      button: 'ENTRAR',
      loading: 'Entrando...',
      errorInvalid: 'Email ou senha incorretos.',
      errorGeneric: 'Ocorreu um erro. Tente novamente.',
      back: 'Voltar ao início',
      noAccount: 'Não tem uma conta?',
      register: 'Cadastrar-se',
      orWith: 'ou continue com',
      continueGoogle: 'Continuar com Google',
      continueApple: 'Continuar com Apple',
    },
  }

  const t = texts[params.locale as keyof typeof texts] ?? texts.es

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message.includes('Invalid') ? t.errorInvalid : t.errorGeneric)
      setLoading(false)
      return
    }

    // Check role to redirect admin → /admin, client → /dashboard
    let redirectTo = searchParams?.redirect || `/${params.locale}/dashboard`
    if (authData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profile?.role === 'admin') {
        redirectTo = `/${params.locale}/admin`
      }
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#c1ed00]/[0.04] blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#00e3fd]/[0.03] blur-[140px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <p className="text-xs font-black tracking-[0.3em] text-[#c1ed00] mb-4">R3SET</p>
          <h1 className="text-5xl font-black tracking-tighter text-white leading-none">
            {t.title}<br />
            <span className="text-[#c1ed00] italic">{t.titleAccent}</span>
          </h1>
          <p className="text-white/40 text-sm mt-3">{t.subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-5">
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
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#c1ed00]/50 transition-colors"
                placeholder="••••••••"
              />
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

          {/* Divider OAuth */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[10px] text-white/20 uppercase tracking-widest">{t.orWith}</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* OAuth buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold hover:bg-white/[0.09] hover:border-white/20 transition-all disabled:opacity-50"
            >
              {oauthLoading === 'google' ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {t.continueGoogle}
            </button>

            {process.env.NEXT_PUBLIC_APPLE_AUTH_ENABLED === 'true' && (
              <button
                onClick={() => handleOAuth('apple')}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold hover:bg-white/[0.09] hover:border-white/20 transition-all disabled:opacity-50"
              >
                {oauthLoading === 'apple' ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="white">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                )}
                {t.continueApple}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Register link */}
          <p className="text-center text-white/40 text-sm mt-4">
            {t.noAccount}{' '}
            <Link href={`/${params.locale}/register`} className="text-[#c1ed00] font-bold hover:underline">
              {t.register}
            </Link>
          </p>
        </div>

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
