/**
 * /api/exercises — Proxy de ejercicios con múltiples fuentes
 *
 * Prioridad:
 *   1. ExerciseDB via RapidAPI (GIFs, 10k req/mes gratis)
 *      → Necesita: RAPIDAPI_EXERCISEDB_KEY en .env.local
 *      → Signup gratis en: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
 *   2. ExerciseDB open-source (exercisedb.dev — GIFs, sin key)
 *   3. wger.de (imágenes estáticas, 100% gratis sin key — fallback garantizado)
 *
 * Parámetros GET:
 *   q          — búsqueda por nombre
 *   bodyPart   — filtro por parte del cuerpo (chest, back, legs, shoulders, waist, upper arms, lower arms, upper legs, lower legs, neck, cardio)
 *   limit      — máximo resultados (default 20, máx 50)
 *   offset     — paginación
 */

import { NextRequest, NextResponse } from 'next/server'

/* ─── Fuente 1: ExerciseDB via RapidAPI ─── */
async function fetchFromRapidAPI(q: string, bodyPart: string, limit: number, offset: number) {
  const key = process.env.RAPIDAPI_EXERCISEDB_KEY
  if (!key) { console.log('[exercises] No RapidAPI key set'); return null }

  const BASE = 'https://exercisedb.p.rapidapi.com'
  const headers: Record<string, string> = {
    'x-rapidapi-key':  key,
    'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
  }

  // Usamos /target/{muscle} en vez de /bodyPart/{bodyPart} — nombres sin espacios, más preciso
  let url: string
  if (bodyPart) {
    url = `${BASE}/exercises/target/${encodeURIComponent(bodyPart)}?limit=${limit}&offset=${offset}`
  } else if (q) {
    url = `${BASE}/exercises/name/${encodeURIComponent(q)}?limit=${limit}&offset=${offset}`
  } else {
    url = `${BASE}/exercises?limit=${limit}&offset=${offset}`
  }

  console.log(`[exercises] Calling RapidAPI: ${url}`)
  // cache: 'no-store' para evitar que Next.js cachee respuestas fallidas
  const res = await fetch(url, { headers, cache: 'no-store' })
  console.log(`[exercises] RapidAPI status: ${res.status}`)

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.log(`[exercises] RapidAPI error body: ${body.slice(0, 200)}`)
    return null
  }

  const data = await res.json()
  const raw: any[] = Array.isArray(data) ? data : (data.exercises ?? [])
  const filtered = q && bodyPart ? raw.filter((e: any) => e.name?.toLowerCase().includes(q.toLowerCase())) : raw
  return filtered.slice(0, limit).map(normalizeExerciseDB)
}

/* ─── Fuente 2: ExerciseDB open-source (exercisedb.dev) ─── */
async function fetchFromExerciseDBDev(q: string, bodyPart: string, limit: number, offset: number) {
  const BASE = 'https://exercisedb.dev/api/v1'

  let url: string
  if (bodyPart) {
    url = `${BASE}/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=${limit}&offset=${offset}`
  } else if (q) {
    url = `${BASE}/exercises/name/${encodeURIComponent(q)}?limit=${limit}&offset=${offset}`
  } else {
    url = `${BASE}/exercises?limit=${limit}&offset=${offset}`
  }

  const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) })
  if (!res.ok) return null

  const data = await res.json()
  const raw: any[] = Array.isArray(data) ? data : (data.exercises ?? data.data ?? [])
  const filtered = q && bodyPart ? raw.filter((e: any) => e.name?.toLowerCase().includes(q.toLowerCase())) : raw
  return filtered.slice(0, limit).map(normalizeExerciseDB)
}

/* ─── Fuente 3: wger.de (fallback garantizado, sin GIFs) ─── */
const WGER_BODY_MAP: Record<string, number> = {
  chest: 11, back: 12, shoulders: 13, 'upper arms': 1, 'lower arms': 10,
  'upper legs': 8, 'lower legs': 14, waist: 10, cardio: 15, neck: 9,
}

async function fetchFromWger(q: string, bodyPart: string, limit: number) {
  const params = new URLSearchParams({ format: 'json', language: '2', limit: String(limit * 2), offset: '0' })
  if (q) params.set('term', q)
  if (bodyPart && WGER_BODY_MAP[bodyPart]) params.set('category', String(WGER_BODY_MAP[bodyPart]))

  const searchRes = await fetch(`https://wger.de/api/v2/exercise/search/?${params}`, { next: { revalidate: 86400 } })
  if (!searchRes.ok) return []

  const searchData = await searchRes.json()
  const suggestions: any[] = searchData.suggestions ?? []

  return suggestions.slice(0, limit).map((s: any) => ({
    id:                String(s.data?.id ?? Math.random()),
    name:              s.value ?? s.data?.name ?? 'Exercise',
    body_part:         bodyPart || 'general',
    equipment:         s.data?.equipment?.[0] ?? 'bodyweight',
    target_muscle:     s.data?.muscles?.[0] ?? 'general',
    secondary_muscles: s.data?.muscles_secondary ?? [],
    gif_url:           null,                      // wger no tiene GIFs
    image_url:         s.data?.image ?? null,     // imagen estática si existe
    instructions:      s.data?.description ? [s.data.description] : [],
    source:            'wger',
  }))
}

/* ─── Normalizer ExerciseDB format ─── */
function normalizeExerciseDB(e: any) {
  // gifUrl de exercisedb.io es un CDN público — no necesita proxy ni auth headers
  return {
    id:                e.id,
    name:              e.name,
    body_part:         e.bodyPart,
    equipment:         e.equipment,
    target_muscle:     e.target,
    secondary_muscles: e.secondaryMuscles ?? [],
    gif_url:           e.gifUrl ?? null,
    image_url:         null,
    instructions:      e.instructions ?? [],
    source:            'exercisedb',
  }
}

/* ─── Handler principal ─── */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q         = searchParams.get('q')?.trim() ?? ''
  // Soporta múltiples body parts separados por coma: ?bodyParts=chest,back
  const bodyParts = (searchParams.get('bodyParts') ?? searchParams.get('bodyPart') ?? '')
    .split(',').map(s => s.trim()).filter(Boolean)
  const limit    = Math.min(Number(searchParams.get('limit') ?? 24), 50)
  const offset   = Number(searchParams.get('offset') ?? 0)

  if (!q && bodyParts.length === 0) {
    return NextResponse.json({ exercises: [], total: 0 })
  }

  try {
    const hasRapidKey = !!process.env.RAPIDAPI_EXERCISEDB_KEY
    console.log(`[exercises] q="${q}" bodyParts=${JSON.stringify(bodyParts)} rapidKey=${hasRapidKey}`)

    let allResults: any[] = []

    if (bodyParts.length > 0) {
      const perPart = Math.ceil(limit / bodyParts.length)
      const fetches = await Promise.all(
        bodyParts.map(async bp => {
          const r = await fetchFromRapidAPI(q, bp, perPart, 0).catch(e => { console.log(`[exercises] RapidAPI error: ${e.message}`); return null })
          if (r) { console.log(`[exercises] RapidAPI OK: ${r.length} results, first gifUrl=${r[0]?.gif_url}`); return r }
          const d = await fetchFromExerciseDBDev(q, bp, perPart, 0).catch(e => { console.log(`[exercises] Dev error: ${e.message}`); return null })
          if (d) { console.log(`[exercises] exercisedb.dev OK: ${d.length} results`); return d }
          const w = await fetchFromWger(q, bp, perPart)
          console.log(`[exercises] wger fallback: ${w.length} results`)
          return w
        })
      )
      // Deduplicar por id
      const seen = new Set<string>()
      for (const chunk of fetches) {
        for (const ex of (chunk ?? [])) {
          if (!seen.has(ex.id)) { seen.add(ex.id); allResults.push(ex) }
        }
      }
    } else {
      // Solo búsqueda por nombre
      const rapid = await fetchFromRapidAPI(q, '', limit, offset).catch(e => { console.log(`[exercises] RapidAPI name error: ${e.message}`); return null })
      if (rapid) { console.log(`[exercises] RapidAPI name OK: ${rapid.length}, gifUrl=${rapid[0]?.gif_url}`); allResults = rapid }
      else {
        const dev = await fetchFromExerciseDBDev(q, '', limit, offset).catch(() => null)
        if (dev) { allResults = dev }
        else { allResults = await fetchFromWger(q, '', limit) }
      }
    }

    if (q && bodyParts.length > 0) {
      allResults = allResults.filter(e => e.name?.toLowerCase().includes(q.toLowerCase()))
    }

    console.log(`[exercises] returning ${allResults.length} results, sample gifUrl: ${allResults[0]?.gif_url ?? 'NULL'}`)
    return NextResponse.json({ exercises: allResults.slice(0, limit), total: allResults.length })
  } catch (err: any) {
    console.error('[/api/exercises]', err)
    return NextResponse.json({ exercises: [], total: 0, error: 'Error buscando ejercicios.' }, { status: 502 })
  }
}

/* ─── Listas de filtros disponibles ─── */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.type === 'bodyParts') {
    return NextResponse.json({
      items: ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist']
    })
  }
  return NextResponse.json({ items: [] })
}
