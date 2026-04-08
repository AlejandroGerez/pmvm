import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminMessagesPage({ params }: { params: { locale: string } }) {
  const supabase = createAdminClient()

  // Obtener el último mensaje de cada cliente (admin client bypasses RLS)
  const { data: clients } = await supabase
    .from('profiles')
    .select(`
      id, full_name,
      messages(id, content, sender_role, read, created_at)
    `)
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  const clientsWithMsgs = (clients ?? [])
    .map((c: any) => {
      const sorted = [...(c.messages ?? [])].sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      return { ...c, lastMessage: sorted[0] ?? null, unread: sorted.filter((m: any) => !m.read && m.sender_role === 'client').length }
    })
    .sort((a: any, b: any) => {
      if (!a.lastMessage) return 1
      if (!b.lastMessage) return -1
      return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl text-white" style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.03em' }}>
          Mensajes
        </h1>
        <p className="text-white/50 mt-1">Conversaciones con tus clientes.</p>
      </div>

      {clientsWithMsgs.length === 0 ? (
        <div className="bg-[#141414] border border-white/10 rounded-xl p-8 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-white/40">No hay conversaciones todavía.</p>
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
          {clientsWithMsgs.map((client: any) => (
            <Link
              key={client.id}
              href={`/${params.locale}/admin/clients/${client.id}?tab=messages`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#ffd11e]/15 flex items-center justify-center text-[#ffd11e] font-bold">
                  {(client.full_name ?? 'C')[0].toUpperCase()}
                </div>
                {client.unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ffd11e] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {client.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${client.unread > 0 ? 'text-white font-semibold' : 'text-white/70'}`}>
                  {client.full_name ?? 'Sin nombre'}
                </p>
                <p className="text-white/40 text-xs truncate">
                  {client.lastMessage
                    ? `${client.lastMessage.sender_role === 'trainer' ? 'Vos: ' : ''}${client.lastMessage.content}`
                    : 'Sin mensajes'}
                </p>
              </div>
              {client.lastMessage && (
                <span className="text-white/20 text-xs flex-shrink-0">
                  {new Date(client.lastMessage.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
