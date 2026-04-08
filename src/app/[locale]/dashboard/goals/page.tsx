import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GoalsDashboardClient, { type DailyGoal } from './GoalsDashboardClient'

export const dynamic = 'force-dynamic'

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayLabel() {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export default async function DashboardGoalsPage({ params }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${params.locale}/login`)

  const dateStr = todayISO()

  // Fetch today's goals for this user
  let { data: goals } = await supabase
    .from('daily_goals')
    .select('id, text, completed, goal_type, target_value, current_value, target_unit, auto_track, sort_order')
    .eq('user_id', user.id)
    .eq('date', dateStr)
    .order('sort_order', { ascending: true })

  // If no goals yet, generate from active assignments for this date
  if (!goals || goals.length === 0) {
    await supabase.rpc('assign_goals_for_date', {
      p_user_id: user.id,
      p_date: dateStr,
    })

    const { data: freshGoals } = await supabase
      .from('daily_goals')
      .select('id, text, completed, goal_type, target_value, current_value, target_unit, auto_track, sort_order')
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .order('sort_order', { ascending: true })

    goals = freshGoals
  }

  return (
    <GoalsDashboardClient
      initialGoals={(goals ?? []) as DailyGoal[]}
      dateLabel={todayLabel()}
    />
  )
}
