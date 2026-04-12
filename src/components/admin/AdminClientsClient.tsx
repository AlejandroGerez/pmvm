'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const row = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }

interface Trainer {
  id: string
  full_name: string | null
  phone: string | null
}

interface Client {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  goal: string | null
  created_at: string
  provider: string
  avatar_url: string | null
  trainer_id: string | null
  routines: any[]
  messages: any[]
}

interface Props { locale: string; clients: Client[]; trainers: Trainer[] }

function ProviderBadge({ provider }: { provider: string }) {
  if (provider === 'google') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/8 text-white/40">
        {/* Google 'G' icon */}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </span>
    )
  }
  if (provider === 'apple') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/8 text-white/40">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        Apple
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/8 text-white/40">
      <span className="material-symbols-outlined text-[9px]">mail</span>
      Email
    </span>
  )
}

function ClientAvatar({ client }: { client: Client }) {
  const [imgError, setImgError] = useState(false)
  const initials = (client.full_name ?? client.email ?? 'C')
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  if (client.avatar_url && !imgError) {
    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
        <Image
          src={client.avatar_url}
          alt={client.full_name ?? ''}
          fill
          className="object-cover"
          sizes="40px"
          unoptimized
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div className="w-10 h-10 bg-[#c1ed00] flex items-center justify-center text-[#3b4a00] font-headline font-black text-sm flex-shrink-0 rounded-full">
      {initials}
    </div>
  )
}

// Para Apple "Hide My Email" — relay addresses tienen formato xxx@privaterelay.appleid.com
function displayEmail(email: string, provider: string): string {
  if (!email) return 'Sin email'
  if (provider === 'apple' && email.endsWith('@privaterelay.appleid.com')) {
    return '(Apple private email)'
  }
  return email
}

// ── Trainer selector inline ────────────────────────────────────────────────
function TrainerSelector({ client, trainers, onAssigned }: {
  client: Client
  trainers: Trainer[]
  onAssigned: (clientId: string, trainerId: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const currentTrainer = trainers.find(t => t.id === client.trainer_id)

  // Cerrar al click afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const assign = async (trainerId: string | null) => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ trainer_id: trainerId })
      .eq('id', client.id)
    setSaving(false)
    if (!error) {
      onAssigned(client.id, trainerId)
      setOpen(false)
    }
  }

  return (
    <div className="relative flex-shrink-0" ref={ref} onClick={e => e.preventDefault()}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
          currentTrainer
            ? 'bg-[#c1ed00]/10 border-[#c1ed00]/30 text-[#c1ed00]'
            : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20 hover:text-white/50'
        }`}
      >
        {saving ? (
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="material-symbols-outlined text-[12px]">person_pin</span>
        )}
        {currentTrainer?.full_name ?? 'Sin trainer'}
        <span className="material-symbols-outlined text-[10px] opacity-60">expand_more</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 z-50 bg-[#1a1a1a] border border-white/15 rounded-xl overflow-hidden shadow-2xl min-w-[180px]"
          >
            <p className="text-[9px] font-black tracking-[0.15em] text-white/30 uppercase px-3 pt-2.5 pb-1">
              Asignar entrenador
            </p>
            {trainers.map(trainer => (
              <button
                key={trainer.id}
                onClick={() => assign(trainer.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-white/8 transition-colors ${
                  trainer.id === client.trainer_id ? 'text-[#c1ed00]' : 'text-white/70'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#c1ed00]/15 flex items-center justify-center text-[#c1ed00] text-[9px] font-black flex-shrink-0">
                  {(trainer.full_name ?? 'T')[0].toUpperCase()}
                </div>
                <span className="truncate">{trainer.full_name}</span>
                {trainer.id === client.trainer_id && (
                  <span className="material-symbols-outlined text-[12px] ml-auto">check</span>
                )}
              </button>
            ))}
            {client.trainer_id && (
              <>
                <div className="mx-3 my-1 h-px bg-white/8" />
                <button
                  onClick={() => assign(null)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[12px]">person_remove</span>
                  Quitar trainer
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function AdminClientsClient({ locale, clients: initialClients, trainers }: Props) {
  const [clients, setClients] = useState(initialClients)
  const [search, setSearch] = useState('')

  const handleTrainerAssigned = (clientId: string, trainerId: string | null) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, trainer_id: trainerId } : c))
  }

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return (
      !q ||
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.goal?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    )
  })

  return (
    <div className="bg-[#0e0e0e] min-h-screen px-6 lg:px-12 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">Gestión</p>
        <h1 className="font-headline text-5xl lg:text-6xl font-black tracking-tighter leading-none">
          CLIENTES<br /><span className="text-[#c1ed00] text-3xl lg:text-4xl italic">BASE DE DATOS</span>
        </h1>
        <motion.div className="mt-4 h-px bg-gradient-to-r from-[#c1ed00]/40 via-white/10 to-transparent"
          initial={{ scaleX: 0, transformOrigin: 'left' }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.7 }} />
        <p className="mt-3 font-label text-[10px] text-white/30 uppercase tracking-widest">
          {clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Search */}
      {clients.length > 0 && (
        <div className="mb-6 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 text-[18px]">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, objetivo..."
            className="w-full bg-white/4 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c1ed00]/40 transition-colors"
          />
        </div>
      )}

      {clients.length === 0 ? (
        <motion.div className="bg-white/3 border border-white/8 rounded-2xl p-16 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <span className="material-symbols-outlined text-5xl text-white/10">group</span>
          <p className="font-label text-[10px] uppercase tracking-widest text-white/30">No hay clientes registrados todavía</p>
        </motion.div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/20 text-xs">
          Sin resultados para &quot;{search}&quot;
        </div>
      ) : (
        <motion.div className="space-y-2" variants={stagger} initial="hidden" animate="visible">
          {filtered.map((client) => {
            const activeRoutines = client.routines?.filter((r: any) => r.active).length ?? 0
            const unreadMsgs = client.messages?.filter((m: any) => !m.read && m.sender_role === 'client').length ?? 0

            return (
              <motion.div key={client.id} variants={row} whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
                <Link
                  href={`/${locale}/admin/clients/${client.id}`}
                  className="flex items-center gap-4 bg-white/3 border border-white/6 hover:border-white/12 p-4 lg:p-5 rounded-xl hover:bg-white/5 transition-all duration-200 group"
                >
                  {/* Avatar (foto de Google/Apple o iniciales) */}
                  <ClientAvatar client={client} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-label text-sm text-white font-bold truncate">
                        {client.full_name ?? 'Sin nombre'}
                      </p>
                      <ProviderBadge provider={client.provider} />
                    </div>
                    <p className="font-label text-[10px] text-white/30 truncate">
                      {displayEmail(client.email, client.provider)}
                    </p>
                    {client.goal && (
                      <p className="font-label text-[10px] text-white/20 truncate mt-0.5">{client.goal}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <p className="font-headline font-black text-lg text-white">{activeRoutines}</p>
                      <p className="font-label text-[9px] uppercase tracking-widest text-white/30">rutinas</p>
                    </div>
                    {unreadMsgs > 0 && (
                      <div className="bg-[#00e3fd]/15 px-2 py-1 rounded-lg flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#00e3fd] text-sm">chat</span>
                        <span className="font-label text-[10px] text-[#00e3fd] font-bold">{unreadMsgs}</span>
                      </div>
                    )}
                  </div>

                  {/* Trainer selector */}
                  <TrainerSelector
                    client={client}
                    trainers={trainers}
                    onAssigned={handleTrainerAssigned}
                  />

                  <span className="material-symbols-outlined text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0">
                    arrow_forward
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
