/**
 * /api/exercises — Busca ejercicios desde la tabla `exercises` de Supabase.
 * Fuente única: nuestra base local. Sin APIs externas.
 *
 * Parámetros GET:
 *   q          — búsqueda por nombre (ilike)
 *   bodyParts  — músculo(s) separados por coma: biceps,pectorals
 *   limit      — máximo resultados (default 24, máx 50)
 *   offset     — paginación
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Mapeo músculo objetivo → body_part de AscendAPI.
 * La API guarda body_part="chest" y target_muscle="pectorals" por separado.
 * Buscamos en ambas columnas para máxima cobertura.
 */
const MUSCLE_TO_BODY_PART: Record<string, string> = {
  pectorals:              'chest',
  lats:                   'back',
  traps:                  'back',
  rhomboids:              'back',
  delts:                  'shoulders',
  biceps:                 'upper arms',
  triceps:                'upper arms',
  forearms:               'lower arms',
  abs:                    'waist',
  obliques:               'waist',
  glutes:                 'upper legs',
  quads:                  'upper legs',
  hamstrings:             'upper legs',
  calves:                 'lower legs',
  'cardiovascular system': 'cardio',
  neck:                   'neck',
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q         = searchParams.get('q')?.trim() ?? ''
  const bodyParts = (searchParams.get('bodyParts') ?? searchParams.get('bodyPart') ?? '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  const limit     = Math.min(Number(searchParams.get('limit') ?? 24), 50)
  const offset    = Number(searchParams.get('offset') ?? 0)

  if (!q && bodyParts.length === 0) {
    return NextResponse.json({ exercises: [], total: 0 })
  }

  try {
    const supabase = getSupabase()

    // Construir OR clauses: para cada músculo buscamos en target_muscle Y body_part
    // Nota: usamos .filter() con 'ilike' para evitar problemas de encoding en .or()
    let query = supabase
      .from('exercises')
      .select('id, name, body_part, equipment, target_muscle, secondary_muscles, gif_url, image_url, instructions, slug, exercise_type')
      .range(offset, offset + limit - 1)

    if (q) {
      query = query.ilike('name', `%${q}%`)
    }

    if (bodyParts.length > 0) {
      // Expandir cada músculo a sus aliases (target_muscle + body_part equivalente)
      const orParts: string[] = []
      for (const bp of bodyParts) {
        orParts.push(`target_muscle.ilike.%${bp}%`)
        const bodyPartAlias = MUSCLE_TO_BODY_PART[bp]
        if (bodyPartAlias) {
          orParts.push(`body_part.ilike.%${bodyPartAlias}%`)
        } else {
          // Si no hay alias, buscar también en body_part por el mismo término
          orParts.push(`body_part.ilike.%${bp}%`)
        }
      }
      query = query.or(orParts.join(','))
    }

    const { data, error } = await query

    if (error) {
      console.error('[exercises] Supabase error:', error.message, error.code)
      return NextResponse.json({ exercises: [], total: 0, error: error.message }, { status: 500 })
    }

    const exercises = (data ?? []).map((ex: any) => ({
      id:                String(ex.id),
      name:              ex.name ?? '',
      body_part:         ex.body_part ?? '',
      equipment:         ex.equipment ?? '',
      target_muscle:     ex.target_muscle ?? '',
      secondary_muscles: ex.secondary_muscles ?? [],
      gif_url:           ex.gif_url ?? null,
      image_url:         ex.image_url ?? null,
      instructions:      ex.instructions ?? [],
      slug:              ex.slug ?? null,
      exercise_type:     ex.exercise_type ?? null,
      source:            'supabase',
    }))

    console.log(`[exercises] ${exercises.length} resultados | q="${q}" bodyParts=${JSON.stringify(bodyParts)}`)

    return NextResponse.json({ exercises, total: exercises.length })

  } catch (err: any) {
    console.error('[/api/exercises] catch:', err)
    return NextResponse.json({ exercises: [], total: 0, error: 'Error buscando ejercicios.' }, { status: 502 })
  }
}

/* POST: devuelve los body_parts distintos existentes en la base */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))

  if (body.type === 'bodyParts') {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('exercises')
        .select('body_part')
        .not('body_part', 'is', null)

      if (error) console.error('[exercises POST] bodyParts error:', error.message)

      if (data && data.length > 0) {
        const parts = [...new Set(data.map((r: any) => r.body_part).filter(Boolean))].sort()
        return NextResponse.json({ items: parts })
      }
    } catch (e) {
      console.error('[exercises POST] bodyParts catch:', e)
    }

    // Fallback a lista conocida
    return NextResponse.json({
      items: ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist']
    })
  }

  return NextResponse.json({ items: [] })
}
