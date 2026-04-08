import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

const locales = ['es', 'en', 'pt']
const defaultLocale = 'es'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const getLocale = () =>
    locales.find((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`) ?? defaultLocale

  const isDashboardRoute = locales.some((l) => pathname.startsWith(`/${l}/dashboard`))
  const isAdminRoute     = locales.some((l) => pathname.startsWith(`/${l}/admin`))
  const isLoginRoute     = locales.some((l) => pathname.startsWith(`/${l}/login`))

  // Rutas públicas — no requieren auth check
  const isPublicRoute = !isDashboardRoute && !isAdminRoute && !isLoginRoute
  if (isPublicRoute) return intlMiddleware(request)

  // Crear cliente Supabase
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const locale = getLocale()

  // Sin sesión → redirige al login
  if ((isDashboardRoute || isAdminRoute) && !user) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  // Nota: el check de rol admin se hace en admin/layout.tsx con createAdminClient()
  // para evitar problemas de RLS en el Edge Runtime del middleware.

  // Con sesión en login → redirige al dashboard
  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/', '/(en|es|pt)/:path*', '/v2'],
}
