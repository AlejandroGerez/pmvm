import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 'next' puede venir como param o lo detectamos del locale
  const nextParam = searchParams.get('next')
  // 'type' distingue OAuth de email confirmation
  const type = searchParams.get('type') // 'oauth' | null

  // Detectar locale del header o default a 'es'
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  const locale = acceptLanguage.startsWith('en') ? 'en' : acceptLanguage.startsWith('pt') ? 'pt' : 'es'

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* ignorar en Route Handlers */ }
        },
      },
    }
  )

  // Helper: redirige al destino correcto según rol + estado de onboarding
  async function redirectByRole(): Promise<NextResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const adminClient = createAdminSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SECRET_KEY!
        )
        const { data: profile } = await adminClient
          .from('profiles')
          .select('role, onboarding_completed')
          .eq('id', user.id)
          .single()

        // Admins van directo al panel, sin onboarding
        if (profile?.role === 'admin') {
          return NextResponse.redirect(`${origin}/${locale}/admin`)
        }

        // Clientes sin onboarding completo → pantalla de bienvenida
        if (!profile?.onboarding_completed) {
          return NextResponse.redirect(`${origin}/${locale}/onboarding`)
        }
      }
    } catch (e) {
      console.error('[auth/callback] role check error:', e)
    }
    return NextResponse.redirect(`${origin}/${locale}/dashboard`)
  }

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // OAuth o next param → redirigir según rol
        if (type === 'oauth' || nextParam) {
          return redirectByRole()
        }
        // Email confirmation
        return NextResponse.redirect(`${origin}/${locale}/auth/confirm`)
      }

      console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    } catch (e) {
      console.error('[auth/callback] exchange threw:', e)
    }
  }

  // Fallback: si ya hay sesión activa (PKCE falló pero el usuario ya está autenticado),
  // redirigir igual en lugar de mostrar error
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      console.log('[auth/callback] session exists despite code error — redirecting by role')
      return redirectByRole()
    }
  } catch { /* ignorar */ }

  // Sin sesión y sin code válido → login con error
  return NextResponse.redirect(`${origin}/${locale}/login?error=callback_error`)
}
