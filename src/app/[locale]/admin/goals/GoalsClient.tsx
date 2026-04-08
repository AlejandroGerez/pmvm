'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

/* ── Types ── */

export type GoalType = 'hydration' | 'steps' | 'training' | 'meals' | 'custom'
export type TargetUnit = 'ml' | 'steps' | 'minutes' | 'meals' | 'boolean'
export type AssignmentStatus = 'activa' | 'vencida' | 'futura' | 'inactiva'

export interface GoalTemplate {
  id: string
  title: string
  goal_type: GoalType
  target_value: number
  target_unit: TargetUnit
  icon: string
  color: string
}

export interface GoalAssignment {
  id: string
  user_id: string
  user_name: string | null
  user_email: string | null
  title: string
  goal_type: GoalType
  target_value: number
  target_unit: TargetUnit
  color: string
  icon: string
  start_date: string
  end_date: string
  is_active: boolean
  notes: string | null
  template_id: string | null
  status: AssignmentStatus
}

export interface UserOption {
  id: string
  full_name: string | null
  email: string
}

/* ── Constants ── */

const TYPE_COLOR: Record<GoalType, string> = {
  hydration: '#00e3fd',
  steps:     '#D1FF26',
  training:  '#ff734a',
  meals:     '#a78bfa',
  custom:    '#ffffff',
}

// Map React Native icon names → Material Symbols (web)
const ICON_MAP: Record<string, string> = {
  'cup-water':  'water_drop',
  'cup':        'water_drop',
  'walk':       'directions_walk',
  'dumbbell':   'fitness_center',
  'food-apple': 'restaurant',
  'food':       'restaurant',
  'target':     'track_changes',
  'star':       'star',
  'run':        'directions_run',
  'bike':       'directions_bike',
  'heart':      'favorite',
  'bed':        'bed',
  'meditation': 'self_improvement',
  'yoga':       'self_improvement',
  'weight':     'monitor_weight',
}
function resolveIcon(raw: string): string {
  return ICON_MAP[raw] ?? raw
}

const TYPE_ICON: Record<GoalType, string> = {
  hydration: 'water_drop',
  steps:     'directions_walk',
  training:  'fitness_center',
  meals:     'restaurant',
  custom:    'star',
}

const TYPE_LABEL: Record<GoalType, string> = {
  hydration: 'Hidratación',
  steps:     'Pasos',
  training:  'Entrenamiento',
  meals:     'Comidas',
  custom:    'Personalizada',
}

const UNIT_LABEL: Record<TargetUnit, string> = {
  ml:      'ml',
  steps:   'pasos',
  minutes: 'minutos',
  meals:   'comidas',
  boolean: '',
}

const UNIT_BY_TYPE: Record<GoalType, TargetUnit> = {
  hydration: 'ml',
  steps:     'steps',
  training:  'boolean',
  meals:     'meals',
  custom:    'boolean',
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

/* ── Helpers ── */

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function targetDisplay(target_value: number, target_unit: TargetUnit): string {
  if (target_unit === 'boolean') return 'Completar'
  if (target_unit === 'ml') return `${(target_value / 1000).toFixed(1)}L`
  return `${target_value.toLocaleString()} ${UNIT_LABEL[target_unit]}`
}

/* ── Empty form ── */

interface AssignForm {
  user_id: string
  template_id: string   // '' = custom
  title: string
  goal_type: GoalType
  target_value: number
  target_unit: TargetUnit
  color: string
  icon: string
  start_date: string
  end_date: string
  notes: string
}

function emptyForm(): AssignForm {
  const today = todayISO()
  const month = new Date(); month.setMonth(month.getMonth() + 1)
  const nextMonth = `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}-${String(month.getDate()).padStart(2,'0')}`
  return {
    user_id: '',
    template_id: '',
    title: '',
    goal_type: 'custom',
    target_value: 1,
    target_unit: 'boolean',
    color: '#D1FF26',
    icon: 'star',
    start_date: today,
    end_date: nextMonth,
    notes: '',
  }
}

/* ── Main component ── */

export default function GoalsClient({
  assignments,
  templates,
  users,
}: {
  assignments: GoalAssignment[]
  templates: GoalTemplate[]
  users: UserOption[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [rows, setRows] = useState<GoalAssignment[]>(assignments)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AssignForm>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<AssignmentStatus | 'todas'>('todas')

  const supabase = createClient()

  /* ── Template selection fills form ── */
  const selectTemplate = (tplId: string) => {
    if (!tplId) {
      setForm(f => ({ ...f, template_id: '', title: '', goal_type: 'custom', target_value: 1, target_unit: 'boolean', color: '#D1FF26', icon: 'star' }))
      return
    }
    const tpl = templates.find(t => t.id === tplId)
    if (!tpl) return
    setForm(f => ({
      ...f,
      template_id: tpl.id,
      title: tpl.title,
      goal_type: tpl.goal_type,
      target_value: tpl.target_value,
      target_unit: tpl.target_unit,
      color: tpl.color,
      icon: tpl.icon,
    }))
  }

  /* ── Goal type change ── */
  const changeType = (type: GoalType) => {
    const unit = UNIT_BY_TYPE[type]
    setForm(f => ({
      ...f,
      goal_type: type,
      target_unit: unit,
      color: TYPE_COLOR[type],
      icon: TYPE_ICON[type],
      target_value: type === 'hydration' ? 2500 : type === 'steps' ? 10000 : type === 'meals' ? 3 : 1,
      template_id: '',
    }))
  }

  /* ── Save assignment ── */
  const handleSave = async () => {
    if (!form.user_id) { setError('Seleccioná un usuario.'); return }
    if (!form.title.trim()) { setError('El nombre de la meta es obligatorio.'); return }
    if (form.end_date < form.start_date) { setError('La fecha de fin debe ser posterior al inicio.'); return }

    setSaving(true); setError(null)

    const { data, error: err } = await supabase
      .from('goal_assignments')
      .insert({
        user_id:      form.user_id,
        template_id:  form.template_id || null,
        title:        form.title.trim(),
        goal_type:    form.goal_type,
        target_value: form.target_value,
        target_unit:  form.target_unit,
        color:        form.color,
        icon:         form.icon,
        start_date:   form.start_date,
        end_date:     form.end_date,
        notes:        form.notes.trim() || null,
        is_active:    true,
      })
      .select()
      .single()

    setSaving(false)
    if (err) { setError(err.message); return }

    // Enrich with user info for immediate display
    const user = users.find(u => u.id === form.user_id)
    const now = todayISO()
    const status: AssignmentStatus = form.start_date > now ? 'futura' : form.end_date < now ? 'vencida' : 'activa'
    setRows(prev => [{
      ...(data as any),
      user_name: user?.full_name ?? null,
      user_email: user?.email ?? '',
      status,
    }, ...prev])

    setShowForm(false)
    setForm(emptyForm())
    startTransition(() => router.refresh())
  }

  /* ── Toggle active ── */
  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('goal_assignments').update({ is_active: !current }).eq('id', id)
    setRows(prev => prev.map(r => r.id === id
      ? { ...r, is_active: !current, status: !current ? (r.start_date > todayISO() ? 'futura' : r.end_date < todayISO() ? 'vencida' : 'activa') : 'inactiva' }
      : r
    ))
  }

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta asignación? El usuario perderá esta meta.')) return
    await supabase.from('goal_assignments').delete().eq('id', id)
    setRows(prev => prev.filter(r => r.id !== id))
  }

  /* ── Filtered rows ── */
  const filtered = filterStatus === 'todas' ? rows : rows.filter(r => r.status === filterStatus)

  const counts = {
    todas:    rows.length,
    activa:   rows.filter(r => r.status === 'activa').length,
    futura:   rows.filter(r => r.status === 'futura').length,
    vencida:  rows.filter(r => r.status === 'vencida').length,
    inactiva: rows.filter(r => r.status === 'inactiva').length,
  }

  /* ── Render ── */
  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white px-6 lg:px-10 py-10 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
        <div>
          <a href="../admin" className="text-white/30 hover:text-white text-xs transition-colors mb-3 inline-block">← Admin</a>
          <h1 className="text-4xl font-black tracking-tighter">
            METAS<br /><span className="text-[#D1FF26]">ASIGNADAS.</span>
          </h1>
          <p className="text-white/30 text-sm mt-2">
            Asigná metas a tus clientes con período definido. Se sincronizan automáticamente con la app.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(emptyForm()); setError(null) }}
          className="flex items-center gap-2 px-5 py-3 bg-[#D1FF26] text-[#3b4a00] font-black text-xs tracking-widest uppercase hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Asignar meta
        </button>
      </div>

      {/* Stats / filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(['todas', 'activa', 'futura', 'vencida', 'inactiva'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all"
            style={{
              borderColor: filterStatus === s
                ? (s === 'todas' ? '#ffffff40' : STATUS_COLOR[s])
                : 'rgba(255,255,255,0.08)',
              backgroundColor: filterStatus === s
                ? (s === 'todas' ? 'rgba(255,255,255,0.06)' : `${STATUS_COLOR[s]}18`)
                : 'transparent',
              color: filterStatus === s
                ? (s === 'todas' ? 'white' : STATUS_COLOR[s])
                : 'rgba(255,255,255,0.3)',
            }}
          >
            {s === 'todas' ? 'Todas' : STATUS_LABEL[s]}
            <span className="opacity-60">{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {['Cliente', 'Meta', 'Tipo', 'Objetivo', 'Período', 'Estado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-white/30 font-normal whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-white/25 text-sm">
                    {filterStatus === 'todas'
                      ? 'No hay asignaciones todavía. Creá la primera.'
                      : `No hay metas ${STATUS_LABEL[filterStatus].toLowerCase()}s.`}
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">

                    {/* Cliente */}
                    <td className="px-4 py-3 min-w-[140px]">
                      <p className="font-semibold text-white text-xs">{r.user_name ?? '—'}</p>
                      <p className="text-[10px] text-white/30 truncate max-w-[130px]">{r.user_email}</p>
                    </td>

                    {/* Meta */}
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <span
                          className="material-symbols-outlined text-[16px] flex-shrink-0"
                          style={{ color: r.color }}
                        >
                          {resolveIcon(r.icon)}
                        </span>
                        <span className="text-white font-medium text-xs leading-tight">{r.title}</span>
                      </div>
                      {r.notes && <p className="text-[10px] text-white/25 mt-1 italic truncate max-w-[150px]">{r.notes}</p>}
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ backgroundColor: `${TYPE_COLOR[r.goal_type]}18`, color: TYPE_COLOR[r.goal_type] }}
                      >
                        {TYPE_LABEL[r.goal_type]}
                      </span>
                    </td>

                    {/* Objetivo */}
                    <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">
                      {targetDisplay(r.target_value, r.target_unit)}
                    </td>

                    {/* Período */}
                    <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">
                      {formatDate(r.start_date)} → {formatDate(r.end_date)}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(r.id, r.is_active)}
                        className="text-[10px] font-black px-2.5 py-1 rounded-full transition-all whitespace-nowrap"
                        style={{
                          backgroundColor: `${STATUS_COLOR[r.status]}18`,
                          color: STATUS_COLOR[r.status],
                        }}
                      >
                        {STATUS_LABEL[r.status]}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-white/20 hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Asignar meta ── */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
        >
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-5 my-8">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight uppercase">Asignar meta</h2>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* 1. Usuario */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">
                <span className="text-[#D1FF26]">1.</span> Cliente
              </label>
              <select
                value={form.user_id}
                onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D1FF26]/50 transition-colors appearance-none"
              >
                <option value="" className="bg-[#1a1a1a]">Seleccioná un cliente...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-[#1a1a1a]">
                    {u.full_name ? `${u.full_name} (${u.email})` : u.email}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Meta: desde template o custom */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">
                <span className="text-[#D1FF26]">2.</span> Meta — elegí una existente o creá una nueva
              </label>

              {/* Templates predefinidos */}
              {templates.length > 0 && (
                <div className="flex flex-col gap-1.5 mb-4">
                  {templates.map(tpl => {
                    const selected = form.template_id === tpl.id
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => selectTemplate(selected ? '' : tpl.id)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all w-full"
                        style={{
                          borderColor: selected ? tpl.color : 'rgba(255,255,255,0.08)',
                          backgroundColor: selected ? `${tpl.color}15` : 'rgba(255,255,255,0.02)',
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-[18px] flex-shrink-0"
                          style={{ color: tpl.color, fontVariationSettings: "'FILL' 1" }}
                        >
                          {resolveIcon(tpl.icon)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white">{tpl.title}</p>
                          <p className="text-[9px] text-white/30 mt-0.5">{targetDisplay(tpl.target_value, tpl.target_unit)}</p>
                        </div>
                        {selected && (
                          <span className="material-symbols-outlined text-[14px] flex-shrink-0" style={{ color: tpl.color }}>
                            check_circle
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 border-t border-white/8" />
                <span className="text-[9px] text-white/20 uppercase tracking-widest whitespace-nowrap">o personalizada</span>
                <div className="flex-1 border-t border-white/8" />
              </div>

              {/* Tipo de meta (para custom o sobreescribir) */}
              <div className="grid grid-cols-5 gap-1.5 mt-4">
                {(Object.keys(TYPE_LABEL) as GoalType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => changeType(type)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg border transition-all"
                    style={{
                      borderColor: form.goal_type === type ? TYPE_COLOR[type] : 'rgba(255,255,255,0.08)',
                      backgroundColor: form.goal_type === type ? `${TYPE_COLOR[type]}15` : 'transparent',
                    }}
                  >
                    <span className="material-symbols-outlined text-[15px]" style={{ color: TYPE_COLOR[type] }}>
                      {TYPE_ICON[type]}
                    </span>
                    <span className="text-[8px] font-bold text-white/50 leading-tight text-center">{TYPE_LABEL[type]}</span>
                  </button>
                ))}
              </div>

              {/* Nombre */}
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value, template_id: '' }))}
                placeholder="Nombre de la meta, ej: Tomar 2L de agua"
                className="mt-3 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D1FF26]/50 transition-colors"
              />

              {/* Objetivo numérico (si aplica) */}
              {form.target_unit !== 'boolean' && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] text-white/30 mb-1.5">Objetivo ({UNIT_LABEL[form.target_unit]})</label>
                    <input
                      type="number"
                      value={form.target_value}
                      onChange={e => setForm(f => ({ ...f, target_value: Number(e.target.value) }))}
                      min="1"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D1FF26]/50"
                    />
                  </div>
                  <p className="text-[10px] text-white/25 mt-5">
                    {form.target_unit === 'ml' && `= ${(form.target_value/1000).toFixed(2)}L`}
                    {form.target_unit === 'steps' && `pasos/día`}
                    {form.target_unit === 'meals' && `comidas/día`}
                  </p>
                </div>
              )}
            </div>

            {/* 3. Período */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">
                <span className="text-[#D1FF26]">3.</span> Período
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-white/25 mb-1.5">Desde</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D1FF26]/50 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/25 mb-1.5">Hasta</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    min={form.start_date}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D1FF26]/50 [color-scheme:dark]"
                  />
                </div>
              </div>
              {/* Quick period shortcuts */}
              <div className="flex gap-2 mt-2">
                {[
                  { label: '1 semana', days: 7 },
                  { label: '2 semanas', days: 14 },
                  { label: '1 mes', days: 30 },
                  { label: '3 meses', days: 90 },
                ].map(({ label, days }) => (
                  <button
                    key={days}
                    onClick={() => {
                      const end = new Date(form.start_date)
                      end.setDate(end.getDate() + days - 1)
                      setForm(f => ({
                        ...f,
                        end_date: `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`,
                      }))
                    }}
                    className="text-[9px] px-2.5 py-1 rounded-full border border-white/10 text-white/30 hover:border-[#D1FF26]/40 hover:text-[#D1FF26] transition-all"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Nota interna (opcional) */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">
                Nota interna <span className="opacity-40">(opcional, solo visible para el admin)</span>
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="ej: ajustada por lesión de rodilla"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-white/10 text-white/40 hover:text-white hover:border-white/30 text-xs font-bold uppercase tracking-widest transition-all rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-[#D1FF26] text-[#3b4a00] text-xs font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all rounded-lg"
              >
                {saving ? 'Asignando...' : 'Asignar meta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
