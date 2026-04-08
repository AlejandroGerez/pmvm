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
    },
  }

  const t = texts[params.locale as keyof typeof texts] ?? texts.es

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

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[10px] text-white/20 uppercase tracking-widest">o</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Register link */}
          <p className="text-center text-white/40 text-sm">
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
