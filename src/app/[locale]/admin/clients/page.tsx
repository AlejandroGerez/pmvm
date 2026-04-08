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

  // Mapa id → { email, provider, avatar_url }
  const userMeta: Record<string, { email: string; provider: string; avatar_url: string | null }> = {}
  users?.forEach((u) => {
    const provider = u.app_metadata?.provider ?? 'email'
    const avatar_url =
      u.user_metadata?.avatar_url ??
      u.user_metadata?.picture ??
      null
    userMeta[u.id] = { email: u.email ?? '', provider, avatar_url }
  })

  const clientsWithEmail = (clients ?? []).map((c: any) => ({
    ...c,
    email:      userMeta[c.id]?.email      ?? '',
    provider:   userMeta[c.id]?.provider   ?? 'email',
    avatar_url: userMeta[c.id]?.avatar_url ?? null,
  }))

  return <AdminClientsClient locale={params.locale} clients={clientsWithEmail} />
}
