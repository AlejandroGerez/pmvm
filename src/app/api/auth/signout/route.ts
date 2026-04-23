import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  await supabase.auth.signOut()

  // Detectar locale del path de la URL de referencia (agnóstico al dominio)
  const referer = req.headers.get('referer') ?? ''
  const localeMatch = referer.match(/\/([a-z]{2})\//)?.[1]
  const validLocales = ['es', 'en', 'pt']
  const locale = localeMatch && validLocales.includes(localeMatch) ? localeMatch : 'es'

  return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
}
