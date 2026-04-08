import { createAdminClient } from '@/lib/supabase/server'
import RoutinesClient, { type Routine, type RoutineAssignment, type UserOption } from './RoutinesClient'

export const dynamic = 'force-dynamic'

export default async function AdminRoutinesPage({ params }: { params: { locale: string } }) {
  const admin = createAdminClient()

  const [
    { data: rawRoutines },
    { data: assignments },
    { data: profiles },
  ] = await Promise.all([
    admin
      .from('routines')
      .select(`
        id, name, description, category, difficulty, estimated_min,
        color, is_template, active, created_at,
        routine_exercises(
          id, name, sets, reps, rest_secs, order_index,
          tempo, weight_note, exercise_notes, exercise_id,
          exercises(id, name, gif_url, body_part, target_muscle, equipment)
        )
      `)
      .eq('is_template', true)
      .order('created_at', { ascending: false }),

    admin
      .from('v_routine_assignments_admin')
      .select('*')
      .order('created_at', { ascending: false }),

    admin
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'client')
      .order('full_name'),
  ])

  // Supabase infiere exercises como array por el join; normalizar a objeto único
  const routines: Routine[] = (rawRoutines ?? []).map((r: any) => ({
    ...r,
    routine_exercises: (r.routine_exercises ?? []).map((re: any) => ({
      ...re,
      exercises: Array.isArray(re.exercises) ? (re.exercises[0] ?? null) : (re.exercises ?? null),
    })),
  }))

  return (
    <RoutinesClient
      locale={params.locale}
      routines={routines}
      assignments={(assignments ?? []) as RoutineAssignment[]}
      users={(profiles ?? []) as UserOption[]}
    />
  )
}
