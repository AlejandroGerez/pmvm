'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, Minus, Scale, Percent, Dumbbell, Plus, X, CheckCircle } from 'lucide-react'

const texts = {
  es: {
    title: 'MI', titleAccent: 'PROGRESO.',
    subtitle: 'Tu evolución a lo largo del tiempo.',
    latest: 'Última medición',
    weight: 'Peso', bodyFat: 'Grasa corporal', muscle: 'Masa muscular',
    history: 'Historial',
    date: 'Fecha', notes: 'Notas',
    kg: 'kg', percent: '%',
    empty: 'Todavía no hay registros.',
    emptyHint: 'Cargá tu primera medición para empezar a ver tu evolución.',
    logBtn: 'Registrar medición',
    form: {
      title: 'Nueva medición',
      weight: 'Peso (kg)', bodyFat: 'Grasa corporal (%)', muscle: 'Masa muscular (kg)',
      notes: 'Notas (opcional)',
      notesPlaceholder: 'Ej: Me siento con más energía, dormí bien...',
      save: 'Guardar', saving: 'Guardando...', cancel: 'Cancelar',
      success: '¡Medición guardada!',
    },
  },
  en: {
    title: 'MY', titleAccent: 'PROGRESS.',
    subtitle: 'Your evolution over time.',
    latest: 'Latest measurement',
    weight: 'Weight', bodyFat: 'Body fat', muscle: 'Muscle mass',
    history: 'History',
    date: 'Date', notes: 'Notes',
    kg: 'kg', percent: '%',
    empty: 'No records yet.',
    emptyHint: 'Log your first measurement to start tracking your evolution.',
    logBtn: 'Log measurement',
    form: {
      title: 'New measurement',
      weight: 'Weight (kg)', bodyFat: 'Body fat (%)', muscle: 'Muscle mass (kg)',
      notes: 'Notes (optional)',
      notesPlaceholder: 'E.g.: Feeling more energized, slept well...',
      save: 'Save', saving: 'Saving...', cancel: 'Cancel',
      success: 'Measurement saved!',
    },
  },
  pt: {
    title: 'MEU', titleAccent: 'PROGRESSO.',
    subtitle: 'Sua evolução ao longo do tempo.',
    latest: 'Última medição',
    weight: 'Peso', bodyFat: 'Gordura corporal', muscle: 'Massa muscular',
    history: 'Histórico',
    date: 'Data', notes: 'Notas',
    kg: 'kg', percent: '%',
    empty: 'Nenhum registro ainda.',
    emptyHint: 'Registre sua primeira medição para começar a ver sua evolução.',
    logBtn: 'Registrar medição',
    form: {
      title: 'Nova medição',
      weight: 'Peso (kg)', bodyFat: 'Gordura corporal (%)', muscle: 'Massa muscular (kg)',
      notes: 'Notas (opcional)',
      notesPlaceholder: 'Ex: Me sinto com mais energia, dormi bem...',
      save: 'Salvar', saving: 'Salvando...', cancel: 'Cancelar',
      success: 'Medição salva!',
    },
  },
}

interface ProgressRecord {
  id: string
  weight_kg: number | null
  body_fat_pct: number | null
  muscle_mass_kg: number | null
  notes: string | null
  created_at: string
}

function trend(records: ProgressRecord[], field: keyof ProgressRecord) {
  if (records.length < 2) return null
  const last = records[records.length - 1][field] as number | null
  const prev = records[records.length - 2][field] as number | null
  if (last == null || prev == null) return null
  const diff = last - prev
  return { diff: Math.abs(diff).toFixed(1), up: diff > 0, same: diff === 0 }
}

export default function ProgressClient({
  locale, records: initialRecords, userId,
}: {
  locale: string
  records: ProgressRecord[]
  userId: string
}) {
  const t = texts[locale as keyof typeof texts] ?? texts.es
  const [records, setRecords] = useState(initialRecords)
  const [showForm, setShowForm] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ weight: '', bodyFat: '', muscle: '', notes: '' })

  const latest = records.length > 0 ? records[records.length - 1] : null

  const weightTrend = trend(records, 'weight_kg')
  const fatTrend = trend(records, 'body_fat_pct')
  const muscleTrend = trend(records, 'muscle_mass_kg')

  const handleSave = async () => {
    if (!form.weight && !form.bodyFat && !form.muscle) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('progress')
      .insert({
        client_id: userId,
        weight_kg: form.weight ? parseFloat(form.weight) : null,
        body_fat_pct: form.bodyFat ? parseFloat(form.bodyFat) : null,
        muscle_mass_kg: form.muscle ? parseFloat(form.muscle) : null,
        notes: form.notes || null,
      })
      .select()
      .single()

    if (!error && data) {
      setRecords(prev => [...prev, data])
      setSaved(true)
      setForm({ weight: '', bodyFat: '', muscle: '', notes: '' })
      setTimeout(() => { setSaved(false); setShowForm(false) }, 1800)
    }
    setSaving(false)
  }

  const localeCode = locale === 'pt' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-AR'

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#ff734a]/5 blur-[140px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#c1ed00]/4 blur-[140px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 px-6 lg:px-10 py-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-5xl font-black tracking-tighter leading-none mb-2">
              {t.title}{' '}
              <span className="text-[#c1ed00] italic">{t.titleAccent}</span>
            </h1>
            <p className="text-white/40 text-sm">{t.subtitle}</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setSaved(false) }}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#c1ed00] text-[#0e0e0e] font-black text-xs tracking-widest rounded-xl hover:bg-[#d4ff00] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.logBtn}
          </button>
        </div>

        {/* Log form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 w-full max-w-md relative">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {saved ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-[#c1ed00] mx-auto mb-3" />
                  <p className="text-white font-bold text-lg">{t.form.success}</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-bold">R3SET</p>
                  <h2 className="text-2xl font-black tracking-tighter mb-6">{t.form.title}</h2>

                  <div className="space-y-4">
                    {[
                      { key: 'weight', label: t.form.weight, placeholder: '80.5', icon: Scale },
                      { key: 'bodyFat', label: t.form.bodyFat, placeholder: '18.0', icon: Percent },
                      { key: 'muscle', label: t.form.muscle, placeholder: '42.0', icon: Dumbbell },
                    ].map(({ key, label, placeholder, icon: Icon }) => (
                      <div key={key}>
                        <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">
                          <Icon className="w-3 h-3" />
                          {label}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={form[key as keyof typeof form]}
                          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#c1ed00]/50 transition-colors"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">
                        {t.form.notes}
                      </label>
                      <textarea
                        rows={2}
                        value={form.notes}
                        onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={t.form.notesPlaceholder}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#c1ed00]/50 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-3 border border-white/10 rounded-xl text-white/40 hover:text-white/70 text-sm font-bold transition-colors"
                    >
                      {t.form.cancel}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || (!form.weight && !form.bodyFat && !form.muscle)}
                      className="flex-1 py-3 bg-[#c1ed00] text-[#0e0e0e] rounded-xl font-black text-sm tracking-widest hover:bg-[#d4ff00] disabled:opacity-40 transition-colors"
                    >
                      {saving ? t.form.saving : t.form.save}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {records.length === 0 ? (
          /* Empty */
          <div className="border border-white/8 rounded-2xl p-12 text-center bg-white/[0.02]">
            <div className="w-16 h-16 rounded-2xl bg-[#ff734a]/10 flex items-center justify-center mx-auto mb-5">
              <TrendingUp className="w-7 h-7 text-[#ff734a]" />
            </div>
            <p className="text-white font-bold text-lg mb-2">{t.empty}</p>
            <p className="text-white/35 text-sm">{t.emptyHint}</p>
          </div>
        ) : (
          <>
            {/* Latest stats */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4">{t.latest}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: t.weight, value: latest?.weight_kg, unit: t.kg, color: '#c1ed00', Icon: Scale, tr: weightTrend, lowerIsBetter: true },
                  { label: t.bodyFat, value: latest?.body_fat_pct, unit: t.percent, color: '#ff734a', Icon: Percent, tr: fatTrend, lowerIsBetter: true },
                  { label: t.muscle, value: latest?.muscle_mass_kg, unit: t.kg, color: '#00e3fd', Icon: Dumbbell, tr: muscleTrend, lowerIsBetter: false },
                ].map(({ label, value, unit, color, Icon, tr, lowerIsBetter }) => {
                  const isGood = tr ? (lowerIsBetter ? !tr.up : tr.up) : null
                  return (
                    <div
                      key={label}
                      className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-0.5 rounded-t-2xl" style={{ background: color }} />
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" style={{ color }} />
                          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</span>
                        </div>
                        {tr && !tr.same && (
                          <div className={`flex items-center gap-0.5 text-xs font-bold ${isGood ? 'text-[#c1ed00]' : 'text-[#ff734a]'}`}>
                            {tr.up
                              ? <TrendingUp className="w-3 h-3" />
                              : <TrendingDown className="w-3 h-3" />}
                            <span>{tr.diff}{unit}</span>
                          </div>
                        )}
                        {tr?.same && <Minus className="w-3 h-3 text-white/20" />}
                      </div>
                      <p className="text-3xl font-black tracking-tight" style={{ color: value != null ? 'white' : undefined }}>
                        {value != null ? `${value}` : '—'}
                        {value != null && <span className="text-base font-normal text-white/40 ml-1">{unit}</span>}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* History table */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4">{t.history}</p>
              <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8">
                        {[t.date, t.weight, t.bodyFat, t.muscle, t.notes].map(h => (
                          <th key={h} className="text-left text-[10px] text-white/30 font-bold uppercase tracking-widest px-5 py-3.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...records].reverse().map((r, i) => (
                        <tr key={r.id} className={`border-b border-white/5 last:border-0 ${i === 0 ? 'bg-white/[0.02]' : ''}`}>
                          <td className="px-5 py-3.5 text-white/50 text-xs whitespace-nowrap">
                            {new Date(r.created_at).toLocaleDateString(localeCode, { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-white">
                            {r.weight_kg != null ? <>{r.weight_kg} <span className="text-white/30 text-xs font-normal">{t.kg}</span></> : <span className="text-white/20">—</span>}
                          </td>
                          <td className="px-5 py-3.5 text-white">
                            {r.body_fat_pct != null ? <>{r.body_fat_pct}<span className="text-white/30 text-xs">{t.percent}</span></> : <span className="text-white/20">—</span>}
                          </td>
                          <td className="px-5 py-3.5 text-white">
                            {r.muscle_mass_kg != null ? <>{r.muscle_mass_kg} <span className="text-white/30 text-xs font-normal">{t.kg}</span></> : <span className="text-white/20">—</span>}
                          </td>
                          <td className="px-5 py-3.5 text-white/40 max-w-[200px] truncate text-xs">
                            {r.notes ?? <span className="text-white/15">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
