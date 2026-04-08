import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Endpoint temporal de debug — eliminarlo en producción
// GET /es/debug-session
export async function GET() {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No session', userError })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    profile,
    profileError,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  })
}
