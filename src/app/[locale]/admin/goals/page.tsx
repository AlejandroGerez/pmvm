import { createClient, createAdminClient } from '@/lib/supabase/server'
import GoalsClient, { type GoalAssignment, type GoalTemplate, type UserOption } from './GoalsClient'

export const dynamic = 'force-dynamic'

export default async function AdminGoalsPage({ params }: { params: { locale: string } }) {
  const supabase = createClient()

  const [
    { data: assignments, error: assignErr },
    { data: templates },
    { data: usersData },
  ] = await Promise.all([
    // Asignaciones con info del usuario (vista del admin)
    supabase
      .from('v_goal_assignments_admin')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200),

    // Templates disponibles para selección rápida
    supabase
      .from('goal_templates')
      .select('id, title, goal_type, target_value, target_unit, icon, color')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),

    // Clientes (no admins) para el selector de usuario
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'client')
      .order('full_name', { ascending: true }),
  ])

  if (assignErr) {
    return (
      <div className="bg-[#0e0e0e] min-h-screen text-white px-6 py-10">
        <p className="text-red-400 text-sm">Error: {assignErr.message}</p>
        <p className="text-white/30 text-xs mt-2">
          Asegurate de haber corrido la migración 010_goal_assignments.sql en Supabase.
        </p>
      </div>
    )
  }

  // Enriquecer usuarios con email desde auth (la vista ya lo tiene para assignments,
  // pero para el selector necesitamos todos los clientes)
  const { data: { users: authUsers } } = await createAdminClient().auth.admin.listUsers()
  const userOptions: UserOption[] = (usersData ?? []).map(p => {
    const authUser = authUsers?.find(u => u.id === p.id)
    return {
      id: p.id,
      full_name: p.full_name,
      email: authUser?.email ?? p.id,
    }
  })

  return (
    <GoalsClient
      assignments={(assignments ?? []) as GoalAssignment[]}
      templates={(templates ?? []) as GoalTemplate[]}
      users={userOptions}
    />
  )
}
