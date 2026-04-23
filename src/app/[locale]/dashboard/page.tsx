import { createClient } from '@/lib/supabase/server'
import ClientDashboardHome from '@/components/dashboard/ClientDashboardHome'

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: routines },
    { data: progress },
    { data: activeSub },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user!.id).single(),
    supabase.from('routines').select('id, name').eq('client_id', user!.id),
    supabase.from('progress').select('id, weight_kg, created_at').eq('client_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('subscriptions')
      .select('*, plans(name, duration_days)')
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  return (
    <ClientDashboardHome
      locale={params.locale}
      displayName={profile?.full_name ?? user!.email?.split('@')[0] ?? 'Atleta'}
      routinesCount={routines?.length ?? 0}
      unreadMessages={0}
      progressCount={progress?.length ?? 0}
      recentProgress={progress ?? []}
      activeSub={activeSub ?? null}
    />
  )
}
