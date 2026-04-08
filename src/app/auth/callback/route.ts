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

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Para flujo OAuth: redirigir según rol del usuario
      if (type === 'oauth' || nextParam) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // Usar admin client para evitar problemas de RLS
            const adminClient = createAdminSupabaseClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            )
            const { data: profile } = await adminClient
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single()

            if (profile?.role === 'admin') {
              return NextResponse.redirect(`${origin}/${locale}/admin`)
            }
          }
        } catch { /* si falla el check de rol, igual mandamos al dashboard */ }

        return NextResponse.redirect(`${origin}/${locale}/dashboard`)
      }

      // Para flujo de email confirmation: redirigir a página de confirmación
      return NextResponse.redirect(`${origin}/${locale}/auth/confirm`)
    }
  }

  // Si algo falla, va al login
  return NextResponse.redirect(`${origin}/${locale}/login?error=callback_error`)
}
