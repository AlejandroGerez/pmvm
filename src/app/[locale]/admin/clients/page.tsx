import { createAdminClient } from '@/lib/supabase/server'
import AdminClientsClient from '@/components/admin/AdminClientsClient'

export default async function AdminClientsPage({ params }: { params: { locale: string } }) {
  const adminClient = createAdminClient()

  const [
    { data: clients },
    { data: { users } },
  ] = await Promise.all([
    // Use admin client to bypass RLS when listing all client profiles
    adminClient
      .from('profiles')
      .select(`id, full_name, phone, goal, created_at, role,
        routines(id, active),
        messages(id, read, sender_role)`)
      .eq('role', 'client')
      .order('created_at', { ascending: false }),
    adminClient.auth.admin.listUsers(),
  ])

  const emailMap: Record<string, string> = {}
  users?.forEach((u) => { emailMap[u.id] = u.email ?? '' })

  const clientsWithEmail = (clients ?? []).map((c: any) => ({
    ...c,
    email: emailMap[c.id] ?? '',
  }))

  return <AdminClientsClient locale={params.locale} clients={clientsWithEmail} />
}
