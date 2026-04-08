'use client'

import { useState, useTransition, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

/* ── Types ── */

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type AssignmentStatus = 'activa' | 'vencida' | 'futura' | 'inactiva'

export interface ExerciseInRoutine {
  id: string
  name: string
  sets: number
  reps: string
  rest_secs: number
  order_index: number
  tempo: string | null
  weight_note: string | null
  exercise_notes: string | null
  exercise_id: string | null
  exercises: {
    id: string
    name: string
    gif_url: string | null
    body_part: string | null
    target_muscle: string | null
    equipment: string | null
  } | null
}

export interface Routine {
  id: string
  name: string
  description: string | null
  category: string | null
  difficulty: Difficulty | null
  estimated_min: number | null
  color: string | null
  is_template: boolean
  active: boolean
  created_at: string
  routine_exercises: ExerciseInRoutine[]
}

export interface RoutineAssignment {
  id: string
  routine_id: string
  user_id: string
  user_name: string | null
  start_date: string
  end_date: string | null
  week_days: number[]
  is_active: boolean
  notes: string | null
  routine_name: string
  routine_category: string | null
  routine_difficulty: Difficulty | null
  routine_color: string | null
  routine_estimated_min: number | null
  status: AssignmentStatus
}

export interface UserOption {
  id: string
  full_name: string | null
}

export interface ExerciseResult {
  id: string
  name: string
  body_part: string
  equipment: string
  target_muscle: string
  secondary_muscles: string[]
  gif_url: string | null
  instructions: string[]
}

/* ── Constants ── */

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  beginner:     '#D1FF26',
  intermediate: '#00e3fd',
  advanced:     '#ff734a',
}
const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner:     'Principiante',
  intermediate: 'Intermedio',
  advanced:     'Avanzado',
}

const STATUS_COLOR: Record<AssignmentStatus, string> = {
  activa:   '#D1FF26',
  futura:   '#00e3fd',
  vencida:  '#ffffff33',
  inactiva: '#ffffff22',
}
const STATUS_LABEL: Record<AssignmentStatus, string> = {
  activa:   'Activa',
  futura:   'Futura',
  vencida:  'Vencida',
  inactiva: 'Inactiva',
}

const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// Cada chip tiene un key (id interno) y el target muscle que manda a la API
const MUSCLE_CHIPS: { key: string; label: string; apiTarget: string }[] = [
  { key: 'pectorals',              label: 'Pecho',              apiTarget: 'pectorals'              },
  { key: 'lats',                   label: 'Espalda',            apiTarget: 'lats'                   },
  { key: 'delts',                  label: 'Hombros',            apiTarget: 'delts'                  },
  { key: 'biceps',                 label: 'Bíceps',             apiTarget: 'biceps'                 },
  { key: 'triceps',                label: 'Tríceps',            apiTarget: 'triceps'                },
  { key: 'forearms',               label: 'Antebrazos',         apiTarget: 'forearms'               },
  { key: 'abs',                    label: 'Abdomen',            apiTarget: 'abs'                    },
  { key: 'glutes',                 label: 'Glúteos',            apiTarget: 'glutes'                 },
  { key: 'quads',                  label: 'Cuádriceps',         apiTarget: 'quads'                  },
  { key: 'hamstrings',             label: 'Isquiotibiales',     apiTarget: 'hamstrings'             },
  { key: 'calves',                 label: 'Pantorrillas',       apiTarget: 'calves'                 },
  { key: 'cardiovascular system',  label: 'Cardio',             apiTarget: 'cardiovascular system'  },
]

const CATEGORIES = ['Fuerza', 'Hipertrofia', 'Cardio', 'Funcional', 'Movilidad', 'HIIT', 'Recuperación']

/* ── Helpers ── */

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
function addDays(iso: string, days: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

/* ── Empty routine form ── */
interface RoutineForm {
  name: string
  description: string
  category: string
  difficulty: Difficulty
  estimated_min: number
  color: string
  exercises: DraftExercise[]
}
interface DraftExercise {
  _key: string
  exercise_id: string | null
  name: string
  gif_url: string | null
  body_part: string | null
  sets: number
  reps: string
  rest_secs: number
  tempo: string
  weight_note: string
  exercise_notes: string
}

function emptyDraft(): RoutineForm {
  return { name: '', description: '', category: 'Hipertrofia', difficulty: 'intermediate', estimated_min: 45, color: '#D1FF26', exercises: [] }
}
function newDraftExercise(ex?: ExerciseResult): DraftExercise {
  return {
    _key: Math.random().toString(36).slice(2),
    exercise_id: ex?.id ?? null,
    name: ex?.name ?? '',
    gif_url: ex?.gif_url ?? null,
    body_part: ex?.body_part ?? null,
    sets: 3, reps: '10', rest_secs: 90,
    tempo: '', weight_note: '', exercise_notes: '',
  }
}

/* ── Main component ── */

export default function RoutinesClient({
  locale,
  routines: initialRoutines,
  assignments: initialAssignments,
  users,
}: {
  locale: string
  routines: Routine[]
  assignments: RoutineAssignment[]
  users: UserOption[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'routines' | 'assignments'>('routines')
  const [routines, setRoutines] = useState(initialRoutines)
  const [assignments, setAssignments] = useState(initialAssignments)

  /* ── Routine creator state ── */
  const [showRoutineForm, setShowRoutineForm] = useState(false)
  const [routineForm, setRoutineForm] = useState<RoutineForm>(emptyDraft())
  const [savingRoutine, setSavingRoutine] = useState(false)
  const [routineError, setRoutineError] = useState<string | null>(null)

  /* ── Exercise picker state ── */
  const [showExPicker, setShowExPicker] = useState(false)
  const [exQuery, setExQuery] = useState('')
  const [exBodyParts, setExBodyParts] = useState<string[]>([])   // multi-select
  const [exResults, setExResults] = useState<ExerciseResult[]>([])
  const [exLoading, setExLoading] = useState(false)
  const [previewEx, setPreviewEx] = useState<ExerciseResult | null>(null)
  const searchTimer = useRef<NodeJS.Timeout | null>(null)

  /* ── Assignment state ── */
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [assignRoutineId, setAssignRoutineId] = useState('')
  const [assignUserId, setAssignUserId] = useState('')
  const [assignStartDate, setAssignStartDate] = useState(todayISO())
  const [assignEndDate, setAssignEndDate] = useState(addDays(todayISO(), 29))
  const [assignWeekDays, setAssignWeekDays] = useState<number[]>([1, 3, 5])
  const [assignNotes, setAssignNotes] = useState('')
  const [savingAssign, setSavingAssign] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)

  /* ── Detail view ── */
  const [detailRoutine, setDetailRoutine] = useState<Routine | null>(null)

  /* ── Exercise search ── */
  const searchExercises = useCallback(async (q: string, bodyParts: string[]) => {
    if (!q && bodyParts.length === 0) { setExResults([]); return }
    setExLoading(true)
    try {
      const params = new URLSearchParams({ limit: '24' })
      if (q) params.set('q', q)
      if (bodyParts.length > 0) {
        // Convertir keys → apiTarget (ej: 'pectorals' → 'pectorals', 'lats' → 'lats')
        const targets = bodyParts.map(k => MUSCLE_CHIPS.find(c => c.key === k)?.apiTarget ?? k)
        params.set('bodyParts', targets.join(','))
      }
      const res = await fetch(`/api/exercises?${params}`)
      const data = await res.json()
      setExResults(data.exercises ?? [])
    } catch { setExResults([]) }
    setExLoading(false)
  }, [])

  const handleExQueryChange = (q: string) => {
    setExQuery(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => searchExercises(q, exBodyParts), 400)
  }
  const toggleBodyPart = (bp: string) => {
    setExBodyParts(prev => {
      const next = prev.includes(bp) ? prev.filter(b => b !== bp) : [...prev, bp]
      searchExercises(exQuery, next)
      return next
    })
  }

  const addExerciseToDraft = (ex: ExerciseResult) => {
    setRoutineForm(f => ({ ...f, exercises: [...f.exercises, newDraftExercise(ex)] }))
    setShowExPicker(false)
    setPreviewEx(null)
  }
  const addEmptyExercise = () => {
    setRoutineForm(f => ({ ...f, exercises: [...f.exercises, newDraftExercise()] }))
  }
  const removeExercise = (key: string) => {
    setRoutineForm(f => ({ ...f, exercises: f.exercises.filter(e => e._key !== key) }))
  }
  const updateExercise = (key: string, field: keyof DraftExercise, value: any) => {
    setRoutineForm(f => ({
      ...f,
      exercises: f.exercises.map(e => e._key === key ? { ...e, [field]: value } : e)
    }))
  }
  const moveExercise = (key: string, dir: -1 | 1) => {
    setRoutineForm(f => {
      const arr = [...f.exercises]
      const idx = arr.findIndex(e => e._key === key)
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= arr.length) return f
      ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
      return { ...f, exercises: arr }
    })
  }

  /* ── Save routine ── */
  const handleSaveRoutine = async () => {
    if (!routineForm.name.trim()) { setRoutineError('El nombre es obligatorio.'); return }
    if (routineForm.exercises.length === 0) { setRoutineError('Agregá al menos un ejercicio.'); return }

    setSavingRoutine(true); setRoutineError(null)

    const { data: routine, error: rErr } = await supabase
      .from('routines')
      .insert({
        name:          routineForm.name.trim(),
        description:   routineForm.description.trim() || null,
        category:      routineForm.category,
        difficulty:    routineForm.difficulty,
        estimated_min: routineForm.estimated_min,
        color:         routineForm.color,
        is_template:   true,
        active:        true,
      })
      .select()
      .single()

    if (rErr || !routine) { setRoutineError(rErr?.message ?? 'Error al crear la rutina.'); setSavingRoutine(false); return }

    const exercisesToInsert = routineForm.exercises.map((ex, idx) => ({
      routine_id:      routine.id,
      exercise_id:     ex.exercise_id || null,
      name:            ex.name.trim() || 'Ejercicio',
      sets:            ex.sets,
      reps:            ex.reps,
      rest_secs:       ex.rest_secs,
      order_index:     idx,
      tempo:           ex.tempo.trim() || null,
      weight_note:     ex.weight_note.trim() || null,
      exercise_notes:  ex.exercise_notes.trim() || null,
    }))

    const { error: exErr } = await supabase.from('routine_exercises').insert(exercisesToInsert)
    if (exErr) { setRoutineError('Rutina creada, pero error al guardar ejercicios.'); setSavingRoutine(false); return }

    // Enrich for display
    const newRoutine: Routine = {
      ...routine,
      routine_exercises: routineForm.exercises.map((ex, idx) => ({
        id: Math.random().toString(36),
        name: ex.name || 'Ejercicio',
        sets: ex.sets, reps: ex.reps, rest_secs: ex.rest_secs,
        order_index: idx, tempo: ex.tempo || null,
        weight_note: ex.weight_note || null, exercise_notes: ex.exercise_notes || null,
        exercise_id: ex.exercise_id,
        exercises: ex.exercise_id ? { id: ex.exercise_id, name: ex.name, gif_url: ex.gif_url, body_part: ex.body_part, target_muscle: null, equipment: null } : null,
      })),
    }
    setRoutines(prev => [newRoutine, ...prev])
    setShowRoutineForm(false)
    setRoutineForm(emptyDraft())
    setSavingRoutine(false)
    startTransition(() => router.refresh())
  }

  /* ── Assign routine ── */
  const handleSaveAssignment = async () => {
    if (!assignRoutineId) { setAssignError('Elegí una rutina.'); return }
    if (!assignUserId) { setAssignError('Elegí un cliente.'); return }
    if (assignWeekDays.length === 0) { setAssignError('Elegí al menos un día de la semana.'); return }

    setSavingAssign(true); setAssignError(null)

    const { data, error } = await supabase
      .from('routine_assignments')
      .insert({
        routine_id:  assignRoutineId,
        user_id:     assignUserId,
        start_date:  assignStartDate,
        end_date:    assignEndDate || null,
        week_days:   assignWeekDays,
        notes:       assignNotes.trim() || null,
        is_active:   true,
      })
      .select()
      .single()

    setSavingAssign(false)
    if (error) { setAssignError(error.message); return }

    const routine = routines.find(r => r.id === assignRoutineId)
    const user = users.find(u => u.id === assignUserId)
    const now = todayISO()
    const status: AssignmentStatus = assignStartDate > now ? 'futura' : !assignEndDate || assignEndDate >= now ? 'activa' : 'vencida'

    setAssignments(prev => [{
      ...(data as any),
      user_name: user?.full_name ?? null,
      routine_name: routine?.name ?? '',
      routine_category: routine?.category ?? null,
      routine_difficulty: routine?.difficulty ?? null,
      routine_color: routine?.color ?? null,
      routine_estimated_min: routine?.estimated_min ?? null,
      status,
    }, ...prev])
    setShowAssignForm(false)
    setAssignRoutineId(''); setAssignUserId(''); setAssignNotes('')
    setAssignWeekDays([1,3,5])
    setAssignStartDate(todayISO()); setAssignEndDate(addDays(todayISO(), 29))
    startTransition(() => router.refresh())
  }

  const toggleAssignmentActive = async (id: string, current: boolean) => {
    await supabase.from('routine_assignments').update({ is_active: !current }).eq('id', id)
    setAssignments(prev => prev.map(a => a.id === id
      ? { ...a, is_active: !current, status: !current ? (a.start_date > todayISO() ? 'futura' : !a.end_date || a.end_date >= todayISO() ? 'activa' : 'vencida') : 'inactiva' }
      : a
    ))
  }
  const deleteAssignment = async (id: string) => {
    if (!confirm('¿Eliminar esta asignación?')) return
    await supabase.from('routine_assignments').delete().eq('id', id)
    setAssignments(prev => prev.filter(a => a.id !== id))
  }
  const deleteRoutine = async (id: string) => {
    if (!confirm('¿Eliminar esta rutina? Se eliminarán también sus asignaciones.')) return
    await supabase.from('routines').delete().eq('id', id)
    setRoutines(prev => prev.filter(r => r.id !== id))
    setAssignments(prev => prev.filter(a => a.routine_id !== id))
  }

  /* ── Render ── */
  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white px-4 lg:px-10 py-10 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <a href={`/${locale}/admin`} className="text-white/30 hover:text-white text-xs transition-colors mb-3 inline-block">← Admin</a>
          <h1 className="text-4xl font-black tracking-tighter">
            RUTINAS<br /><span className="text-[#D1FF26]">& EJERCICIOS.</span>
          </h1>
          <p className="text-white/30 text-sm mt-2">Creá plantillas de rutinas y asignáselas a tus clientes.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'routines' && (
            <button
              onClick={() => { setShowRoutineForm(true); setRoutineForm(emptyDraft()); setRoutineError(null) }}
              className="flex items-center gap-2 px-5 py-3 bg-[#D1FF26] text-[#3b4a00] font-black text-xs tracking-widest uppercase hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nueva rutina
            </button>
          )}
          {activeTab === 'assignments' && (
            <button
              onClick={() => { setShowAssignForm(true); setAssignError(null) }}
              className="flex items-center gap-2 px-5 py-3 bg-[#D1FF26] text-[#3b4a00] font-black text-xs tracking-widest uppercase hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Asignar rutina
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/8">
        {([
          { key: 'routines',    label: 'Mis rutinas',  count: routines.length },
          { key: 'assignments', label: 'Asignaciones', count: assignments.length },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-xs font-black tracking-widest uppercase border-b-2 -mb-px transition-all ${
              activeTab === tab.key
                ? 'border-[#D1FF26] text-[#D1FF26]'
                : 'border-transparent text-white/30 hover:text-white'
            }`}
          >
            {tab.label} <span className="opacity-50 ml-1">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: ROUTINES ── */}
      {activeTab === 'routines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {routines.length === 0 && (
            <div className="col-span-full text-center py-20 text-white/20">
              <span className="material-symbols-outlined text-5xl block mb-3">fitness_center</span>
              No hay rutinas todavía. Creá la primera.
            </div>
          )}
          {routines.map(routine => (
            <div
              key={routine.id}
              className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all group"
            >
              {/* Color bar */}
              <div className="h-1 w-full" style={{ backgroundColor: routine.color ?? '#D1FF26' }} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-black text-sm tracking-tight leading-tight">{routine.name}</h3>
                    {routine.category && (
                      <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">{routine.category}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => { setAssignRoutineId(routine.id); setShowAssignForm(true) }}
                      title="Asignar a cliente"
                      className="p-1.5 text-white/30 hover:text-[#D1FF26] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                    </button>
                    <button
                      onClick={() => setDetailRoutine(routine)}
                      title="Ver detalle"
                      className="p-1.5 text-white/30 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    </button>
                    <button
                      onClick={() => deleteRoutine(routine.id)}
                      title="Eliminar"
                      className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  {routine.difficulty && (
                    <span
                      className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                      style={{ backgroundColor: `${DIFFICULTY_COLOR[routine.difficulty]}18`, color: DIFFICULTY_COLOR[routine.difficulty] }}
                    >
                      {DIFFICULTY_LABEL[routine.difficulty]}
                    </span>
                  )}
                  {routine.estimated_min && (
                    <span className="flex items-center gap-1 text-[10px] text-white/30">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      {routine.estimated_min} min
                    </span>
                  )}
                  <span className="text-[10px] text-white/30">
                    {routine.routine_exercises.length} ejercicios
                  </span>
                </div>

                {/* Exercise GIF strip */}
                {routine.routine_exercises.length > 0 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {routine.routine_exercises.slice(0, 5).map((ex, i) => (
                      <div
                        key={ex.id}
                        className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/8 relative"
                        title={ex.name}
                      >
                        {ex.exercises?.gif_url ? (
                          <img
                            src={ex.exercises.gif_url}
                            alt={ex.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px] text-white/20">fitness_center</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {routine.routine_exercises.length > 5 && (
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-[10px] text-white/30 font-bold">
                        +{routine.routine_exercises.length - 5}
                      </div>
                    )}
                  </div>
                )}

                {/* Assignments count */}
                {(() => {
                  const n = assignments.filter(a => a.routine_id === routine.id && a.is_active).length
                  return n > 0 ? (
                    <p className="text-[10px] text-[#D1FF26] mt-3">
                      <span className="material-symbols-outlined text-[12px] align-middle mr-0.5">group</span>
                      {n} cliente{n !== 1 ? 's' : ''} asignado{n !== 1 ? 's' : ''}
                    </p>
                  ) : null
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: ASSIGNMENTS ── */}
      {activeTab === 'assignments' && (
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Cliente', 'Rutina', 'Nivel', 'Días', 'Período', 'Estado', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-white/30 font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-white/25 text-sm">No hay asignaciones todavía.</td></tr>
                ) : assignments.map(a => (
                  <tr key={a.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 min-w-[130px]">
                      <p className="font-semibold text-white text-xs">{a.user_name ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.routine_color ?? '#D1FF26' }} />
                        <div>
                          <p className="text-white font-medium text-xs">{a.routine_name}</p>
                          {a.routine_category && <p className="text-[9px] text-white/25">{a.routine_category}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {a.routine_difficulty && (
                        <span
                          className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase"
                          style={{ backgroundColor: `${DIFFICULTY_COLOR[a.routine_difficulty]}18`, color: DIFFICULTY_COLOR[a.routine_difficulty] }}
                        >
                          {DIFFICULTY_LABEL[a.routine_difficulty]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs">
                      {a.week_days?.map(d => WEEK_DAYS[d]).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                      {formatDate(a.start_date)} {a.end_date ? `→ ${formatDate(a.end_date)}` : '→ ∞'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAssignmentActive(a.id, a.is_active)}
                        className="text-[9px] font-black px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{ backgroundColor: `${STATUS_COLOR[a.status]}18`, color: STATUS_COLOR[a.status] }}
                      >
                        {STATUS_LABEL[a.status]}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteAssignment(a.id)} className="text-white/20 hover:text-red-400 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: Routine detail
      ═══════════════════════════════════════════════════════ */}
      {detailRoutine && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setDetailRoutine(null) }}>
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-2xl my-8 overflow-hidden">
            <div className="h-1" style={{ backgroundColor: detailRoutine.color ?? '#D1FF26' }} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight">{detailRoutine.name}</h2>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {detailRoutine.category && <span className="text-[10px] text-white/40">{detailRoutine.category}</span>}
                    {detailRoutine.difficulty && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: `${DIFFICULTY_COLOR[detailRoutine.difficulty]}18`, color: DIFFICULTY_COLOR[detailRoutine.difficulty] }}>
                        {DIFFICULTY_LABEL[detailRoutine.difficulty]}
                      </span>
                    )}
                    {detailRoutine.estimated_min && <span className="text-[10px] text-white/30">{detailRoutine.estimated_min} min</span>}
                  </div>
                  {detailRoutine.description && <p className="text-sm text-white/40 mt-2">{detailRoutine.description}</p>}
                </div>
                <button onClick={() => setDetailRoutine(null)} className="text-white/30 hover:text-white"><span className="material-symbols-outlined">close</span></button>
              </div>

              <div className="space-y-3">
                {detailRoutine.routine_exercises
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((ex, idx) => (
                  <div key={ex.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    <span className="text-[10px] text-white/20 font-black w-6 flex-shrink-0">{String(idx+1).padStart(2,'0')}</span>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      {ex.exercises?.gif_url ? (
                        <img src={ex.exercises.gif_url} alt={ex.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px] text-white/20">fitness_center</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{ex.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-white/40">{ex.sets} series × {ex.reps} reps</span>
                        <span className="text-[10px] text-white/30">{ex.rest_secs}s descanso</span>
                        {ex.tempo && <span className="text-[10px] text-white/30">Tempo {ex.tempo}</span>}
                        {ex.weight_note && <span className="text-[10px] text-[#D1FF26]/70">{ex.weight_note}</span>}
                      </div>
                      {ex.exercise_notes && <p className="text-[10px] text-white/25 mt-0.5 italic">{ex.exercise_notes}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setAssignRoutineId(detailRoutine.id); setDetailRoutine(null); setShowAssignForm(true) }}
                className="mt-6 w-full py-3 bg-[#D1FF26] text-[#3b4a00] text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all"
              >
                Asignar esta rutina a un cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: Create routine
      ═══════════════════════════════════════════════════════ */}
      {showRoutineForm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setShowRoutineForm(false) }}>
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-2xl my-8 p-6 space-y-5">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight uppercase">Nueva rutina</h2>
              <button onClick={() => setShowRoutineForm(false)} className="text-white/30 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">Nombre</label>
              <input
                type="text"
                value={routineForm.name}
                onChange={e => setRoutineForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ej: Fuerza — Tren Superior A"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D1FF26]/50"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">Descripción <span className="opacity-40">(opcional)</span></label>
              <textarea
                rows={2}
                value={routineForm.description}
                onChange={e => setRoutineForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción breve de la rutina..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 resize-none"
              />
            </div>

            {/* Categoría + Dificultad + Duración */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">Categoría</label>
                <select
                  value={routineForm.category}
                  onChange={e => setRoutineForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D1FF26]/50 appearance-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">Nivel</label>
                <select
                  value={routineForm.difficulty}
                  onChange={e => setRoutineForm(f => ({ ...f, difficulty: e.target.value as Difficulty }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D1FF26]/50 appearance-none"
                >
                  <option value="beginner" className="bg-[#1a1a1a]">Principiante</option>
                  <option value="intermediate" className="bg-[#1a1a1a]">Intermedio</option>
                  <option value="advanced" className="bg-[#1a1a1a]">Avanzado</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">Duración (min)</label>
                <input
                  type="number"
                  value={routineForm.estimated_min}
                  onChange={e => setRoutineForm(f => ({ ...f, estimated_min: Number(e.target.value) }))}
                  min={15} max={180}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D1FF26]/50"
                />
              </div>
            </div>

            {/* Ejercicios */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[10px] uppercase tracking-widest text-white/30">
                  Ejercicios <span className="text-white/20">({routineForm.exercises.length})</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowExPicker(true); setExResults([]); setExQuery(''); setExBodyParts([]) }}
                    className="flex items-center gap-1 text-[10px] px-3 py-1.5 bg-[#D1FF26]/10 text-[#D1FF26] border border-[#D1FF26]/20 rounded-lg hover:bg-[#D1FF26]/20 transition-all font-bold"
                  >
                    <span className="material-symbols-outlined text-[14px]">search</span>
                    Buscar ejercicio
                  </button>
                  <button
                    onClick={addEmptyExercise}
                    className="flex items-center gap-1 text-[10px] px-3 py-1.5 bg-white/5 text-white/40 border border-white/10 rounded-lg hover:text-white hover:bg-white/8 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Manual
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {routineForm.exercises.map((ex, idx) => (
                  <div key={ex._key} className="bg-white/3 border border-white/8 rounded-xl p-3">
                    <div className="flex items-start gap-3">
                      {/* GIF */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        {ex.gif_url ? (
                          <img src={ex.gif_url} alt={ex.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px] text-white/20">fitness_center</span>
                          </div>
                        )}
                      </div>

                      {/* Nombre */}
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={ex.name}
                          onChange={e => updateExercise(ex._key, 'name', e.target.value)}
                          placeholder="Nombre del ejercicio"
                          className="w-full bg-transparent text-sm font-bold text-white placeholder-white/20 focus:outline-none border-b border-white/10 pb-1 focus:border-[#D1FF26]/50"
                        />
                        {ex.body_part && <p className="text-[9px] text-white/25 mt-1 capitalize">{ex.body_part}</p>}
                      </div>

                      {/* Move + delete */}
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveExercise(ex._key, -1)} disabled={idx === 0} className="text-white/20 hover:text-white disabled:opacity-10 transition-colors">
                          <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                        </button>
                        <button onClick={() => moveExercise(ex._key, 1)} disabled={idx === routineForm.exercises.length - 1} className="text-white/20 hover:text-white disabled:opacity-10 transition-colors">
                          <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                        </button>
                      </div>
                      <button onClick={() => removeExercise(ex._key)} className="text-white/20 hover:text-red-400 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>

                    {/* Sets/Reps/Rest/Tempo */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {[
                        { label: 'Series', field: 'sets' as const, type: 'number', placeholder: '3' },
                        { label: 'Reps',   field: 'reps' as const, type: 'text',   placeholder: '10' },
                        { label: 'Desc. (s)', field: 'rest_secs' as const, type: 'number', placeholder: '90' },
                        { label: 'Tempo',  field: 'tempo' as const, type: 'text',   placeholder: '3-1-2' },
                      ].map(({ label, field, type, placeholder }) => (
                        <div key={field}>
                          <label className="block text-[8px] text-white/25 mb-1 uppercase tracking-widest">{label}</label>
                          <input
                            type={type}
                            value={(ex as any)[field]}
                            onChange={e => updateExercise(ex._key, field, type === 'number' ? Number(e.target.value) : e.target.value)}
                            placeholder={placeholder}
                            className="w-full bg-white/5 border border-white/8 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#D1FF26]/40"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Notas */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { label: 'Carga sugerida', field: 'weight_note' as const, placeholder: 'ej: 70% 1RM' },
                        { label: 'Notas',          field: 'exercise_notes' as const, placeholder: 'ej: contracción en pico' },
                      ].map(({ label, field, placeholder }) => (
                        <div key={field}>
                          <label className="block text-[8px] text-white/25 mb-1 uppercase tracking-widest">{label}</label>
                          <input
                            type="text"
                            value={(ex as any)[field]}
                            onChange={e => updateExercise(ex._key, field, e.target.value)}
                            placeholder={placeholder}
                            className="w-full bg-white/5 border border-white/8 rounded-md px-2 py-1.5 text-xs text-white placeholder-white/15 focus:outline-none focus:border-white/20"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {routineForm.exercises.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-xl text-white/20 text-xs">
                    No hay ejercicios. Buscá uno arriba o agregá uno manualmente.
                  </div>
                )}
              </div>
            </div>

            {routineError && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{routineError}</p>}

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowRoutineForm(false)} className="flex-1 py-3 border border-white/10 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all">Cancelar</button>
              <button onClick={handleSaveRoutine} disabled={savingRoutine} className="flex-1 py-3 bg-[#D1FF26] text-[#3b4a00] text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
                {savingRoutine ? 'Guardando...' : 'Guardar rutina'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: Exercise picker — responsive, multi-select
      ═══════════════════════════════════════════════════════ */}
      {showExPicker && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex flex-col"
          onClick={e => { if (e.target === e.currentTarget) { setShowExPicker(false); setPreviewEx(null) } }}
        >
          {/* Panel centrado, full-height en mobile */}
          <div className="flex-1 flex flex-col bg-[#141414] w-full max-w-2xl mx-auto border-x border-white/8 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
              <div>
                <h3 className="font-black text-sm uppercase tracking-tight">Buscar ejercicio</h3>
                {exBodyParts.length > 0 && (
                  <p className="text-[9px] text-[#D1FF26] mt-0.5">{exBodyParts.length} músculo{exBodyParts.length > 1 ? 's' : ''} seleccionado{exBodyParts.length > 1 ? 's' : ''}</p>
                )}
              </div>
              <button onClick={() => { setShowExPicker(false); setPreviewEx(null) }} className="text-white/30 hover:text-white p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Search bar */}
            <div className="px-4 pt-3 pb-2 flex-shrink-0">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-[16px]">search</span>
                <input
                  type="text"
                  value={exQuery}
                  onChange={e => handleExQueryChange(e.target.value)}
                  placeholder="ej: bench press, squat, curl..."
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D1FF26]/50"
                />
              </div>
            </div>

            {/* Muscle chips — horizontal scroll, multi-select */}
            <div className="px-4 pb-3 flex-shrink-0">
              <p className="text-[8px] uppercase tracking-widest text-white/25 mb-1.5">Grupo muscular (selección múltiple)</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {MUSCLE_CHIPS.map(chip => {
                  const active = exBodyParts.includes(chip.key)
                  return (
                    <button
                      key={chip.key}
                      onClick={() => toggleBodyPart(chip.key)}
                      className="flex-shrink-0 text-[10px] px-3 py-1.5 rounded-full border font-bold transition-all"
                      style={{
                        borderColor: active ? '#D1FF26' : 'rgba(255,255,255,0.1)',
                        backgroundColor: active ? '#D1FF2622' : 'transparent',
                        color: active ? '#D1FF26' : 'rgba(255,255,255,0.35)',
                      }}
                    >
                      {chip.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Preview panel (shown when exercise selected) */}
            {previewEx && (
              <div className="mx-4 mb-3 flex-shrink-0 bg-white/3 border border-white/10 rounded-2xl overflow-hidden flex gap-0">
                {previewEx.gif_url && (
                  <div className="w-28 h-28 flex-shrink-0 bg-black">
                    <img
                      src={previewEx.gif_url}
                      alt={previewEx.name}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                )}
                <div className="flex-1 p-3 min-w-0">
                  <p className="font-bold text-sm text-white capitalize leading-tight truncate">{previewEx.name}</p>
                  <p className="text-[10px] text-white/35 capitalize mt-0.5">{previewEx.body_part} · {previewEx.equipment}</p>
                  <p className="text-[10px] text-[#D1FF26]/70 capitalize mt-0.5">{previewEx.target_muscle}</p>
                  {previewEx.instructions[0] && (
                    <p className="text-[9px] text-white/25 mt-1 line-clamp-2 leading-relaxed">{previewEx.instructions[0]}</p>
                  )}
                </div>
                <button
                  onClick={() => addExerciseToDraft(previewEx)}
                  className="flex-shrink-0 m-3 px-4 bg-[#D1FF26] text-[#3b4a00] text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 self-center"
                >
                  + Agregar
                </button>
              </div>
            )}

            {/* Results grid — scrollable */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
              {exLoading && (
                <div className="flex items-center justify-center py-16 text-white/30 gap-2">
                  <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                  <span className="text-xs">Buscando ejercicios...</span>
                </div>
              )}

              {!exLoading && exResults.length === 0 && (exQuery || exBodyParts.length > 0) && (
                <div className="text-center py-16 text-white/20 text-xs">Sin resultados. Probá otro término o músculo.</div>
              )}

              {!exLoading && exResults.length === 0 && !exQuery && exBodyParts.length === 0 && (
                <div className="text-center py-16 text-white/15 text-xs">Buscá por nombre o elegí un grupo muscular arriba.</div>
              )}

              {!exLoading && exResults.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {exResults.map(ex => {
                    const isSelected = previewEx?.id === ex.id
                    return (
                      <button
                        key={ex.id}
                        onClick={() => setPreviewEx(isSelected ? null : ex)}
                        className="text-left rounded-xl border overflow-hidden transition-all active:scale-[0.98]"
                        style={{
                          borderColor: isSelected ? '#D1FF26' : 'rgba(255,255,255,0.08)',
                          backgroundColor: isSelected ? 'rgba(209,255,38,0.06)' : 'rgba(255,255,255,0.02)',
                        }}
                      >
                        {/* GIF / imagen */}
                        <div className="aspect-square bg-[#0a0a0a] relative overflow-hidden">
                          {ex.gif_url ? (
                            <img
                              src={ex.gif_url}
                              alt={ex.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={e => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.nextElementSibling?.removeAttribute('hidden')
                              }}
                            />
                          ) : null}
                          <div hidden={!!ex.gif_url} className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-3xl text-white/10">fitness_center</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#D1FF26] rounded-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-[12px] text-[#3b4a00]">check</span>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-[10px] font-bold text-white leading-tight capitalize line-clamp-2">{ex.name}</p>
                          <p className="text-[9px] text-white/30 capitalize mt-0.5">{ex.body_part}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: Assign routine
      ═══════════════════════════════════════════════════════ */}
      {showAssignForm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setShowAssignForm(false) }}>
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg my-8 p-6 space-y-5">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight uppercase">Asignar rutina</h2>
              <button onClick={() => setShowAssignForm(false)} className="text-white/30 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>

            {/* 1. Rutina */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">
                <span className="text-[#D1FF26]">1.</span> Rutina
              </label>
              <div className="flex flex-col gap-1.5">
                {routines.map(r => {
                  const selected = assignRoutineId === r.id
                  return (
                    <button
                      key={r.id}
                      onClick={() => setAssignRoutineId(r.id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all"
                      style={{
                        borderColor: selected ? (r.color ?? '#D1FF26') : 'rgba(255,255,255,0.08)',
                        backgroundColor: selected ? `${r.color ?? '#D1FF26'}12` : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color ?? '#D1FF26' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{r.name}</p>
                        <p className="text-[9px] text-white/30 mt-0.5">
                          {r.category} · {r.routine_exercises.length} ejercicios {r.estimated_min ? `· ${r.estimated_min}min` : ''}
                        </p>
                      </div>
                      {selected && <span className="material-symbols-outlined text-[14px]" style={{ color: r.color ?? '#D1FF26' }}>check_circle</span>}
                    </button>
                  )
                })}
                {routines.length === 0 && <p className="text-xs text-white/30 py-3 text-center">No hay rutinas creadas todavía.</p>}
              </div>
            </div>

            {/* 2. Cliente */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">
                <span className="text-[#D1FF26]">2.</span> Cliente
              </label>
              <select
                value={assignUserId}
                onChange={e => setAssignUserId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D1FF26]/50 appearance-none"
              >
                <option value="" className="bg-[#1a1a1a]">Seleccioná un cliente...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-[#1a1a1a]">{u.full_name ?? u.id}</option>
                ))}
              </select>
            </div>

            {/* 3. Días de la semana */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">
                <span className="text-[#D1FF26]">3.</span> Días de entrenamiento
              </label>
              <div className="flex gap-1.5">
                {WEEK_DAYS.map((day, i) => {
                  const selected = assignWeekDays.includes(i)
                  return (
                    <button
                      key={i}
                      onClick={() => setAssignWeekDays(prev => selected ? prev.filter(d => d !== i) : [...prev, i].sort())}
                      className="flex-1 py-2 rounded-lg text-[10px] font-black border transition-all"
                      style={{
                        borderColor: selected ? '#D1FF26' : 'rgba(255,255,255,0.08)',
                        backgroundColor: selected ? '#D1FF2618' : 'transparent',
                        color: selected ? '#D1FF26' : 'rgba(255,255,255,0.25)',
                      }}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 4. Período */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">
                <span className="text-[#D1FF26]">4.</span> Período
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-white/25 mb-1.5">Desde</label>
                  <input type="date" value={assignStartDate} onChange={e => setAssignStartDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D1FF26]/50 [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[9px] text-white/25 mb-1.5">Hasta <span className="opacity-40">(opcional)</span></label>
                  <input type="date" value={assignEndDate} min={assignStartDate} onChange={e => setAssignEndDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D1FF26]/50 [color-scheme:dark]" />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                {[{l:'1 semana',d:7},{l:'4 semanas',d:28},{l:'2 meses',d:60},{l:'Sin fin',d:0}].map(({l,d}) => (
                  <button key={l} onClick={() => d === 0 ? setAssignEndDate('') : setAssignEndDate(addDays(assignStartDate, d-1))}
                    className="text-[9px] px-2.5 py-1 rounded-full border border-white/10 text-white/30 hover:border-[#D1FF26]/40 hover:text-[#D1FF26] transition-all">{l}</button>
                ))}
              </div>
            </div>

            {/* Nota */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">Nota interna <span className="opacity-40">(opcional)</span></label>
              <input type="text" value={assignNotes} onChange={e => setAssignNotes(e.target.value)} placeholder="ej: adaptar peso por lesión" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20" />
            </div>

            {assignError && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{assignError}</p>}

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowAssignForm(false)} className="flex-1 py-3 border border-white/10 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all">Cancelar</button>
              <button onClick={handleSaveAssignment} disabled={savingAssign} className="flex-1 py-3 bg-[#D1FF26] text-[#3b4a00] text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
                {savingAssign ? 'Asignando...' : 'Asignar rutina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
