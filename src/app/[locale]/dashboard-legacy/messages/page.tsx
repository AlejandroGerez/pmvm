'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Message {
  id: string
  content: string
  sender_role: 'client' | 'trainer'
  created_at: string
  read: boolean
}

const texts = {
  es: {
    title: 'Mensajes',
    subtitle: 'Tu canal directo con tu entrenador.',
    placeholder: 'Escribí un mensaje...',
    send: 'Enviar',
    empty: 'Todavía no hay mensajes. ¡Mandá el primero!',
    you: 'Vos',
    trainer: 'Entrenador',
  },
  en: {
    title: 'Messages',
    subtitle: 'Your direct channel with your trainer.',
    placeholder: 'Write a message...',
    send: 'Send',
    empty: 'No messages yet. Send the first one!',
    you: 'You',
    trainer: 'Trainer',
  },
  pt: {
    title: 'Mensagens',
    subtitle: 'Seu canal direto com seu treinador.',
    placeholder: 'Escreva uma mensagem...',
    send: 'Enviar',
    empty: 'Nenhuma mensagem ainda. Envie a primeira!',
    you: 'Você',
    trainer: 'Treinador',
  },
}

export default function MessagesPage({ params }: { params: { locale: string } }) {
  const t = texts[params.locale as keyof typeof texts] ?? texts.es
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: true })
        setMessages(data ?? [])

        // Marcar como leídos los mensajes del trainer
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('client_id', user.id)
          .eq('sender_role', 'trainer')
          .eq('read', false)
      }
    }
    init()
  }, [supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Suscripción en tiempo real
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `client_id=eq.${user.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || sending) return

    setSending(true)
    const { data } = await supabase
      .from('messages')
      .insert({
        client_id: user.id,
        content: newMessage.trim(),
        sender_role: 'client',
        read: false,
      })
      .select()
      .single()

    if (data) setMessages((prev) => [...prev, data])
    setNewMessage('')
    setSending(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[700px]">
      {/* Header */}
      <div className="mb-4">
        <h1
          className="text-4xl text-white"
          style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.03em' }}
        >
          {t.title}
        </h1>
        <p className="text-white/50 mt-1">{t.subtitle}</p>
      </div>

      {/* Chat container */}
      <div className="flex-1 bg-[#141414] border border-white/10 rounded-xl flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-white/40 text-sm">{t.empty}</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isClient = msg.sender_role === 'client'
              return (
                <div
                  key={msg.id}
                  className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${isClient ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <span className="text-white/30 text-xs px-1">
                      {isClient ? t.you : t.trainer}
                    </span>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isClient
                          ? 'bg-[#ffd11e] text-black rounded-br-sm'
                          : 'bg-white/10 text-white rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-white/20 text-xs px-1">
                      {new Date(msg.created_at).toLocaleTimeString(params.locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="border-t border-white/10 p-3 flex gap-2"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#ffd11e] transition-colors"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-[#ffd11e] text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-[#e6bc1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            {t.send}
          </button>
        </form>
      </div>
    </div>
  )
}
