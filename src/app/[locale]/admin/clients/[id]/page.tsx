import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AdminClientTabs from '@/components/admin/AdminClientTabs'
import Link from 'next/link'

export default async function AdminClientDetailPage({
  params,
}: {
  params: { locale: string; id: string }
}) {
  const supabase = createClient()

  const [
    { data: profile },
    { data: routines },
    { data: progress },
    { data: messages },
    { data: { users } },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', params.id).single(),
    supabase.from('routines').select('*, routine_exercises(*)').eq('client_id', params.id).order('created_at', { ascending: false }),
    supabase.from('progress').select('*').eq('client_id', params.id).order('created_at', { ascending: false }),
    supabase.from('messages').select('*').eq('client_id', params.id).order('created_at', { ascending: true }),
    createAdminClient().auth.admin.listUsers(),
  ])

  if (!profile) notFound()

  const clientEmail = users?.find((u) => u.id === params.id)?.email ?? ''

  // Marcar mensajes del cliente como leídos
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('client_id', params.id)
    .eq('sender_role', 'client')
    .eq('read', false)

  const initials = (profile.full_name ?? 'C').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="bg-[#0e0e0e] min-h-screen px-6 lg:px-12 py-10 max-w-5xl mx-auto space-y-8">
      {/* Back */}
      <Link
        href={`/${params.locale}/admin/clients`}
        className="inline-flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Volver a clientes
      </Link>

      {/* Header */}
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-[#c1ed00] flex items-center justify-center text-[#3b4a00] font-headline font-black text-xl flex-shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="font-headline font-black text-4xl tracking-tighter leading-none uppercase">
            {profile.full_name ?? 'Sin nombre'}
          </h1>
          <p className="font-label text-[10px] text-white/30 uppercase tracking-widest mt-1">
            {profile.goal ?? 'Sin objetivo definido'}
            {clientEmail && <span className="ml-3 text-[#00e3fd]">{clientEmail}</span>}
          </p>
        </div>
      </div>

      {/* Tabs con toda la gestión */}
      <AdminClientTabs
        clientId={params.id}
        locale={params.locale}
        routines={routines ?? []}
        progress={progress ?? []}
        messages={messages ?? []}
      />
    </div>
  )
}
