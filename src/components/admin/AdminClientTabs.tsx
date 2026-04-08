'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Exercise { id: string; name: string; sets: number; reps: string; rest_secs: number; notes: string; order_index: number }
interface Routine { id: string; name: string; description: string; days_per_week: number; active: boolean; created_at: string; routine_exercises: Exercise[] }
interface ProgressRecord { id: string; weight_kg: number; body_fat_pct: number; muscle_mass_kg: number; notes: string; created_at: string }
interface Message { id: string; content: string; sender_role: 'client' | 'trainer'; read: boolean; created_at: string }

interface Props {
  clientId: string
  locale: string
  routines: Routine[]
  progress: ProgressRecord[]
  messages: Message[]
}

export default function AdminClientTabs({ clientId, locale, routines: initialRoutines, progress: initialProgress, messages: initialMessages }: Props) {
  const [tab, setTab] = useState<'routines' | 'progress' | 'messages'>('routines')
  const [routines, setRoutines] = useState(initialRoutines)
  const [progress, setProgress] = useState(initialProgress)
  const [messages, setMessages] = useState(initialMessages)
  const supabase = createClient()

  // ── ROUTINES state ──
  const [showRoutineForm, setShowRoutineForm] = useState(false)
  const [routineName, setRoutineName] = useState('')
  const [routineDesc, setRoutineDesc] = useState('')
  const [routineDays, setRoutineDays] = useState(3)
  const [savingRoutine, setSavingRoutine] = useState(false)
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null)
  const [showExerciseForm, setShowExerciseForm] = useState<string | null>(null)
  const [exName, setExName] = useState('')
  const [exSets, setExSets] = useState(3)
  const [exReps, setExReps] = useState('10')
  const [exRest, setExRest] = useState(60)
  const [exNotes, setExNotes] = useState('')
  const [savingEx, setSavingEx] = useState(false)

  // ── PROGRESS state ──
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [pWeight, setPWeight] = useState('')
  const [pFat, setPFat] = useState('')
  const [pMuscle, setPMuscle] = useState('')
  const [pNotes, setPNotes] = useState('')
  const [savingProgress, setSavingProgress] = useState(false)

  // ── MESSAGES state ──
  const [newMsg, setNewMsg] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, tab])

  // Real-time messages
  useEffect(() => {
    const channel = supabase
      .channel(`admin-messages-${clientId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `client_id=eq.${clientId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [clientId])

  // Add routine
  const handleAddRoutine = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingRoutine(true)
    const { data } = await supabase.from('routines').insert({
      client_id: clientId, name: routineName, description: routineDesc, days_per_week: routineDays, active: true,
    }).select('*, routine_exercises(*)').single()
    if (data) setRoutines((prev) => [data, ...prev])
    setRoutineName(''); setRoutineDesc(''); setRoutineDays(3)
    setShowRoutineForm(false); setSavingRoutine(false)
  }

  // Toggle active
  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('routines').update({ active: !current }).eq('id', id)
    setRoutines((prev) => prev.map((r) => r.id === id ? { ...r, active: !current } : r))
  }

  // Delete routine
  const deleteRoutine = async (id: string) => {
    if (!confirm('¿Eliminar esta rutina?')) return
    await supabase.from('routines').delete().eq('id', id)
    setRoutines((prev) => prev.filter((r) => r.id !== id))
  }

  // Add exercise
  const handleAddExercise = async (e: React.FormEvent, routineId: string) => {
    e.preventDefault()
    setSavingEx(true)
    const { data } = await supabase.from('routine_exercises').insert({
      routine_id: routineId, name: exName, sets: exSets, reps: exReps, rest_secs: exRest, notes: exNotes, order_index: 0,
    }).select().single()
    if (data) {
      setRoutines((prev) => prev.map((r) => r.id === routineId
        ? { ...r, routine_exercises: [...r.routine_exercises, data] }
        : r
      ))
    }
    setExName(''); setExSets(3); setExReps('10'); setExRest(60); setExNotes('')
    setShowExerciseForm(null); setSavingEx(false)
  }

  // Delete exercise
  const deleteExercise = async (routineId: string, exId: string) => {
    await supabase.from('routine_exercises').delete().eq('id', exId)
    setRoutines((prev) => prev.map((r) => r.id === routineId
      ? { ...r, routine_exercises: r.routine_exercises.filter((ex) => ex.id !== exId) }
      : r
    ))
  }

  // Add progress
  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProgress(true)
    const { data } = await supabase.from('progress').insert({
      client_id: clientId,
      weight_kg: pWeight ? parseFloat(pWeight) : null,
      body_fat_pct: pFat ? parseFloat(pFat) : null,
      muscle_mass_kg: pMuscle ? parseFloat(pMuscle) : null,
      notes: pNotes || null,
    }).select().single()
    if (data) setProgress((prev) => [data, ...prev])
    setPWeight(''); setPFat(''); setPMuscle(''); setPNotes('')
    setShowProgressForm(false); setSavingProgress(false)
  }

  // Delete progress
  const deleteProgress = async (id: string) => {
    if (!confirm('¿Eliminar este registro?')) return
    await supabase.from('progress').delete().eq('id', id)
    setProgress((prev) => prev.filter((p) => p.id !== id))
  }

  const handleSendMsg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMsg.trim() || sendingMsg) return
    setSendingMsg(true)
    const content = newMsg.trim()
    const { data } = await supabase.from('messages').insert({
      client_id: clientId, content, sender_role: 'trainer', read: false,
    }).select().single()
    if (data) setMessages((prev) => [...prev, data])
    setNewMsg(''); setSendingMsg(false)
  }

  const tabs = [
    { key: 'routines', label: 'Rutinas', icon: '💪', count: routines.length },
    { key: 'progress', label: 'Progreso', icon: '📈', count: progress.length },
    { key: 'messages', label: 'Mensajes', icon: '💬', count: messages.filter((m) => !m.read && m.sender_role === 'client').length },
  ]

  return (
    <div>
      {/* Tabs nav */}
      <div className="flex gap-1 bg-[#141414] border border-white/10 rounded-xl p-1 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-[#ffd11e] text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-black/20 text-black' : 'bg-white/10 text-white/60'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── RUTINAS ── */}
      {tab === 'routines' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowRoutineForm(!showRoutineForm)}
              className="bg-[#ffd11e] text-black font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#e6bc1a] transition-colors"
            >
              + Nueva rutina
            </button>
          </div>

          {showRoutineForm && (
            <form onSubmit={handleAddRoutine} className="bg-[#141414] border border-[#ffd11e]/30 rounded-xl p-5 space-y-3">
              <h3 className="text-white font-semibold">Nueva rutina</h3>
              <input value={routineName} onChange={(e) => setRoutineName(e.target.value)} required placeholder="Nombre de la rutina" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ffd11e]" />
              <textarea value={routineDesc} onChange={(e) => setRoutineDesc(e.target.value)} placeholder="Descripción (opcional)" rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ffd11e] resize-none" />
              <div className="flex items-center gap-3">
                <label className="text-white/50 text-sm">Días/semana:</label>
                <input type="number" value={routineDays} onChange={(e) => setRoutineDays(parseInt(e.target.value))} min={1} max={7} className="w-16 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ffd11e]" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={savingRoutine} className="bg-[#ffd11e] text-black font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#e6bc1a] disabled:opacity-50">
                  {savingRoutine ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setShowRoutineForm(false)} className="text-white/40 text-sm px-4 py-2 hover:text-white">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {routines.length === 0 && !showRoutineForm && (
            <div className="bg-[#141414] border border-white/10 rounded-xl p-6 text-center">
              <p className="text-white/40 text-sm">No hay rutinas asignadas todavía.</p>
            </div>
          )}

          {routines.map((routine) => (
            <div key={routine.id} className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden">
              {/* Header rutina */}
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{routine.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${routine.active ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                      {routine.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  {routine.description && <p className="text-white/40 text-sm">{routine.description}</p>}
                  <p className="text-white/30 text-xs mt-1">📅 {routine.days_per_week}x por semana · 🏋️ {routine.routine_exercises.length} ejercicios</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(routine.id, routine.active)} className="text-xs text-white/40 hover:text-white px-2 py-1 rounded hover:bg-white/5">
                    {routine.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => setExpandedRoutine(expandedRoutine === routine.id ? null : routine.id)} className="text-xs text-[#ffd11e] px-2 py-1 rounded hover:bg-[#ffd11e]/10">
                    {expandedRoutine === routine.id ? 'Ocultar' : 'Ejercicios'}
                  </button>
                  <button onClick={() => deleteRoutine(routine.id)} className="text-xs text-red-400/60 hover:text-red-400 px-2 py-1 rounded hover:bg-red-400/5">
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Ejercicios */}
              {expandedRoutine === routine.id && (
                <div className="border-t border-white/10 p-4 space-y-2">
                  {routine.routine_exercises.length === 0 && (
                    <p className="text-white/30 text-sm text-center py-2">Sin ejercicios todavía.</p>
                  )}
                  {routine.routine_exercises.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-white text-sm font-medium">{ex.name}</span>
                        <span className="text-white/40 text-xs ml-3">{ex.sets}×{ex.reps} · {ex.rest_secs}s descanso</span>
                        {ex.notes && <span className="text-white/30 text-xs ml-2">— {ex.notes}</span>}
                      </div>
                      <button onClick={() => deleteExercise(routine.id, ex.id)} className="text-red-400/40 hover:text-red-400 text-xs ml-3">✕</button>
                    </div>
                  ))}

                  {/* Form ejercicio */}
                  {showExerciseForm === routine.id ? (
                    <form onSubmit={(e) => handleAddExercise(e, routine.id)} className="bg-white/5 rounded-lg p-3 space-y-2 mt-2">
                      <input value={exName} onChange={(e) => setExName(e.target.value)} required placeholder="Nombre del ejercicio" className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#ffd11e]" />
                      <div className="grid grid-cols-3 gap-2">
                        <div><label className="text-white/30 text-xs">Series</label><input type="number" value={exSets} onChange={(e) => setExSets(parseInt(e.target.value))} min={1} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#ffd11e]" /></div>
                        <div><label className="text-white/30 text-xs">Reps</label><input value={exReps} onChange={(e) => setExReps(e.target.value)} placeholder="10" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#ffd11e]" /></div>
                        <div><label className="text-white/30 text-xs">Descanso (s)</label><input type="number" value={exRest} onChange={(e) => setExRest(parseInt(e.target.value))} min={0} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#ffd11e]" /></div>
                      </div>
                      <input value={exNotes} onChange={(e) => setExNotes(e.target.value)} placeholder="Notas (opcional)" className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#ffd11e]" />
                      <div className="flex gap-2">
                        <button type="submit" disabled={savingEx} className="bg-[#ffd11e] text-black font-semibold text-xs px-3 py-1.5 rounded hover:bg-[#e6bc1a] disabled:opacity-50">{savingEx ? '...' : 'Agregar'}</button>
                        <button type="button" onClick={() => setShowExerciseForm(null)} className="text-white/40 text-xs px-3 py-1.5 hover:text-white">Cancelar</button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => setShowExerciseForm(routine.id)} className="w-full text-center text-[#ffd11e] text-xs py-2 border border-[#ffd11e]/20 rounded-lg hover:bg-[#ffd11e]/5 transition-colors mt-1">
                      + Agregar ejercicio
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── PROGRESO ── */}
      {tab === 'progress' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowProgressForm(!showProgressForm)} className="bg-[#ffd11e] text-black font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#e6bc1a] transition-colors">
              + Nuevo registro
            </button>
          </div>

          {showProgressForm && (
            <form onSubmit={handleAddProgress} className="bg-[#141414] border border-[#ffd11e]/30 rounded-xl p-5 space-y-3">
              <h3 className="text-white font-semibold">Nuevo registro de progreso</h3>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-white/50 text-xs block mb-1">Peso (kg)</label><input type="number" step="0.1" value={pWeight} onChange={(e) => setPWeight(e.target.value)} placeholder="80.5" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ffd11e]" /></div>
                <div><label className="text-white/50 text-xs block mb-1">Grasa (%)</label><input type="number" step="0.1" value={pFat} onChange={(e) => setPFat(e.target.value)} placeholder="18.2" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ffd11e]" /></div>
                <div><label className="text-white/50 text-xs block mb-1">Músculo (kg)</label><input type="number" step="0.1" value={pMuscle} onChange={(e) => setPMuscle(e.target.value)} placeholder="42.0" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ffd11e]" /></div>
              </div>
              <textarea value={pNotes} onChange={(e) => setPNotes(e.target.value)} placeholder="Notas (opcional)" rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ffd11e] resize-none" />
              <div className="flex gap-2">
                <button type="submit" disabled={savingProgress} className="bg-[#ffd11e] text-black font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#e6bc1a] disabled:opacity-50">
                  {savingProgress ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setShowProgressForm(false)} className="text-white/40 text-sm px-4 py-2 hover:text-white">Cancelar</button>
              </div>
            </form>
          )}

          {progress.length === 0 && !showProgressForm ? (
            <div className="bg-[#141414] border border-white/10 rounded-xl p-6 text-center">
              <p className="text-white/40 text-sm">No hay registros de progreso todavía.</p>
            </div>
          ) : (
            <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/40 font-medium px-5 py-3">Fecha</th>
                    <th className="text-right text-white/40 font-medium px-4 py-3">Peso</th>
                    <th className="text-right text-white/40 font-medium px-4 py-3">Grasa</th>
                    <th className="text-right text-white/40 font-medium px-4 py-3">Músculo</th>
                    <th className="text-left text-white/40 font-medium px-4 py-3">Notas</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {progress.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-3 text-white/70">{new Date(p.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-3 text-right text-white">{p.weight_kg != null ? `${p.weight_kg} kg` : '—'}</td>
                      <td className="px-4 py-3 text-right text-white">{p.body_fat_pct != null ? `${p.body_fat_pct}%` : '—'}</td>
                      <td className="px-4 py-3 text-right text-white">{p.muscle_mass_kg != null ? `${p.muscle_mass_kg} kg` : '—'}</td>
                      <td className="px-4 py-3 text-white/50 max-w-xs truncate">{p.notes ?? '—'}</td>
                      <td className="px-3 py-3"><button onClick={() => deleteProgress(p.id)} className="text-red-400/40 hover:text-red-400 text-xs">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MENSAJES ── */}
      {tab === 'messages' && (
        <div className="flex flex-col h-[520px] bg-surface-container-low overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00e3fd] text-sm">chat</span>
              <span className="font-label text-[10px] uppercase tracking-widest text-white/40">Canal de Mensajes</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined text-4xl text-white/10">chat</span>
                <p className="text-white/30 font-label text-[10px] uppercase tracking-widest">No hay mensajes todavía</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isTrainer = msg.sender_role === 'trainer'
                return (
                  <div key={msg.id} className={`flex ${isTrainer ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] flex flex-col gap-1 ${isTrainer ? 'items-end' : 'items-start'}`}>
                      <span className="font-label text-[9px] uppercase tracking-widest text-white/25 px-1">
                        {isTrainer ? 'Coach' : 'Cliente'}
                      </span>
                      <div className={`px-4 py-2.5 text-sm font-body ${
                        isTrainer
                          ? 'bg-[#cefc22] text-[#3b4a00]'
                          : 'bg-white/8 text-white border border-white/10'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="font-label text-[9px] text-white/20 px-1">
                        {new Date(msg.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSendMsg} className="border-t border-white/5 p-3 flex gap-2 bg-[#0e0e0e]">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Escribí un mensaje al cliente…"
              className="flex-1 bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm font-body placeholder-white/20 focus:outline-none focus:border-[#c1ed00] transition-colors"
            />
            <button
              type="submit"
              disabled={!newMsg.trim() || sendingMsg}
              className="bg-[#cefc22] text-[#3b4a00] font-headline font-bold px-5 py-2.5 text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-30 flex items-center gap-1.5"
            >
              {sendingMsg
                ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-sm">send</span>
              }
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
