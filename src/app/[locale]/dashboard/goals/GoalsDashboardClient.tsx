'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export type GoalType = 'hydration' | 'steps' | 'training' | 'meals' | 'custom'
export type TargetUnit = 'ml' | 'steps' | 'minutes' | 'meals' | 'boolean'

export interface DailyGoal {
  id: string
  text: string
  completed: boolean
  goal_type: GoalType
  target_value: number
  current_value: number
  target_unit: TargetUnit
  auto_track: boolean
  sort_order: number
}

const TYPE_COLOR: Record<GoalType, string> = {
  hydration: '#00e3fd',
  steps:     '#D1FF26',
  training:  '#ff734a',
  meals:     '#a78bfa',
  custom:    '#ffffff',
}

const TYPE_ICON: Record<GoalType, string> = {
  hydration: 'water_drop',
  steps:     'directions_walk',
  training:  'fitness_center',
  meals:     'restaurant',
  custom:    'star',
}

const ICON_MAP: Record<string, string> = {
  'cup-water': 'water_drop', 'cup': 'water_drop', 'walk': 'directions_walk',
  'dumbbell': 'fitness_center', 'food-apple': 'restaurant', 'food': 'restaurant',
  'target': 'track_changes', 'run': 'directions_run', 'heart': 'favorite',
  'meditation': 'self_improvement', 'yoga': 'self_improvement', 'weight': 'monitor_weight',
}
function resolveIcon(raw: string): string { return ICON_MAP[raw] ?? raw }

function progressLabel(goal: DailyGoal): string | null {
  if (goal.target_unit === 'boolean') return null
  const cur = goal.current_value ?? 0
  const tgt = goal.target_value ?? 1
  switch (goal.target_unit) {
    case 'ml':      return `${(cur / 1000).toFixed(1)}L / ${(tgt / 1000).toFixed(1)}L`
    case 'steps':   return `${cur.toLocaleString()} / ${tgt.toLocaleString()} pasos`
    case 'minutes': return `${Math.round(cur)} / ${Math.round(tgt)} min`
    case 'meals':   return `${Math.round(cur)} / ${Math.round(tgt)} comidas`
    default:        return null
  }
}

function progressPct(goal: DailyGoal): number {
  if (!goal.auto_track || !goal.target_value) return goal.completed ? 1 : 0
  return Math.min((goal.current_value ?? 0) / goal.target_value, 1)
}

export default function GoalsDashboardClient({
  initialGoals,
  dateLabel,
}: {
  initialGoals: DailyGoal[]
  dateLabel: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [goals, setGoals] = useState<DailyGoal[]>(initialGoals)
  const [toggling, setToggling] = useState<string | null>(null)

  const supabase = createClient()

  const completed = goals.filter(g => g.completed).length
  const total = goals.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  const handleToggle = async (goal: DailyGoal) => {
    if (toggling) return
    const newCompleted = !goal.completed
    setToggling(goal.id)

    // Optimistic update
    setGoals(prev => prev.map(g =>
      g.id === goal.id ? { ...g, completed: newCompleted } : g
    ))

    const updates: Record<string, unknown> = { completed: newCompleted }
    if (goal.auto_track && newCompleted) {
      updates.current_value = goal.target_value
    }

    const { error } = await supabase
      .from('daily_goals')
      .update(updates)
      .eq('id', goal.id)

    if (error) {
      // Revert on error
      setGoals(prev => prev.map(g =>
        g.id === goal.id ? { ...g, completed: !newCompleted } : g
      ))
    }

    setToggling(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white px-6 lg:px-10 py-10 max-w-2xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">{dateLabel}</p>
        <h1 className="text-4xl font-black tracking-tighter">
          METAS<br />
          <span className="text-[#D1FF26]">DEL DÍA.</span>
        </h1>
      </motion.div>

      {/* Progress ring + summary */}
      {total > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 bg-white/3 border border-white/8 rounded-2xl p-5 flex items-center gap-6"
        >
          {/* Circular progress */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#D1FF26" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset="0"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-black text-[#D1FF26]">{pct}%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-white">{completed} <span className="text-white/30 font-normal text-lg">/ {total}</span></p>
            <p className="text-xs text-white/40 mt-0.5">metas completadas hoy</p>
            {completed === total && total > 0 && (
              <p className="text-xs text-[#D1FF26] font-bold mt-1.5">¡Día perfecto!</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Goals list */}
      {total === 0 ? (
        <div className="text-center py-16 text-white/30">
          <span className="material-symbols-outlined text-5xl mb-3 block opacity-20">track_changes</span>
          <p className="text-sm">No hay metas asignadas para hoy.</p>
          <p className="text-xs mt-1 opacity-60">El coach las configura desde el panel admin.</p>
        </div>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {goals.map((goal) => {
            const label = progressLabel(goal)
            const pctGoal = progressPct(goal)
            const color = TYPE_COLOR[goal.goal_type]
            const icon = TYPE_ICON[goal.goal_type]

            return (
              <motion.div
                key={goal.id}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => handleToggle(goal)}
                  disabled={toggling === goal.id}
                  className="w-full text-left"
                >
                  <div
                    className="rounded-xl border transition-all duration-300 p-4"
                    style={{
                      backgroundColor: goal.completed ? `${color}0d` : 'rgba(255,255,255,0.02)',
                      borderColor: goal.completed ? `${color}40` : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}18` }}
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ color, fontVariationSettings: goal.completed ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {icon}
                        </span>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold leading-tight"
                          style={{
                            color: goal.completed ? 'rgba(255,255,255,0.45)' : 'white',
                            textDecoration: goal.completed ? 'line-through' : 'none',
                          }}
                        >
                          {goal.text}
                        </p>
                        {label && (
                          <p className="text-[10px] mt-1" style={{ color: `${color}99` }}>
                            {label}
                          </p>
                        )}
                      </div>

                      {/* Checkbox */}
                      <div
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                        style={{
                          borderColor: goal.completed ? color : 'rgba(255,255,255,0.15)',
                          backgroundColor: goal.completed ? color : 'transparent',
                        }}
                      >
                        <AnimatePresence>
                          {goal.completed && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="material-symbols-outlined text-[13px] text-black font-black"
                              style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
                            >
                              check
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Progress bar (for auto-tracked goals) */}
                    {goal.auto_track && goal.target_unit !== 'boolean' && (
                      <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round(pctGoal * 100)}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    )}
                  </div>
                </button>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <p className="text-[10px] text-white/15 text-center mt-10">
        Las metas con barra de progreso se sincronizan automáticamente desde la app.
      </p>
    </div>
  )
}
