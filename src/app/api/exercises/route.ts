/**
 * /api/exercises — Proxy de ejercicios con múltiples fuentes
 *
 * Prioridad para IMÁGENES:
 *   1. yuhonas/free-exercise-db (GitHub CDN — JPG images, ~800 ejercicios, sin key)
 *   2. ExerciseDB via RapidAPI (metadatos sin imágenes en plan gratuito)
 *   3. wger.de (fallback garantizado, sin imágenes)
 *
 * Parámetros GET:
 *   q          — búsqueda por nombre
 *   bodyParts  — músculo(s) separados por coma: biceps,pectorals
 *   limit      — máximo resultados (default 24, máx 50)
 *   offset     — paginación
 */

import { NextRequest, NextResponse } from 'next/server'

/* ─── Types ─── */
interface Exercise {
  id: string
  name: string
  body_part: string
  equipment: string
  target_muscle: string
  secondary_muscles: string[]
  gif_url: string | null   // GIF cuando disponible
  image_url: string | null // JPG fallback
  instructions: string[]
  source: string
}

/* ═══════════════════════════════════════════════════════════════
   FUENTE 1: yuhonas/free-exercise-db
   GitHub: https://github.com/yuhonas/free-exercise-db
   ~800 ejercicios con imágenes JPG, 100% gratuito, sin key
   Imágenes vía jsDelivr CDN (rápido, sin rate limit)
   ═══════════════════════════════════════════════════════════════ */

// Mapeo de nuestros apiTarget → primaryMuscles en el dataset de yuhonas
const YUHONAS_MUSCLE_MAP: Record<string, string[]> = {
  pectorals:             ['chest'],
  lats:                  ['lats'],
  delts:                 ['shoulders'],
  biceps:                ['biceps'],
  triceps:               ['triceps'],
  forearms:              ['forearms'],
  abs:                   ['abdominals'],
  glutes:                ['glutes'],
  quads:                 ['quadriceps'],
  hamstrings:            ['hamstrings'],
  calves:                ['calves'],
  'cardiovascular system': ['abdominals', 'quadriceps'], // cardio no tiene músculo exacto
  // Aliases adicionales por si llega alguno de RapidAPI
  chest:                 ['chest'],
  shoulders:             ['shoulders'],
  'upper arms':          ['biceps', 'triceps'],
  'lower arms':          ['forearms'],
  'upper legs':          ['quadriceps', 'hamstrings'],
  'lower legs':          ['calves'],
  waist:                 ['abdominals'],
  back:                  ['lats', 'middle back', 'lower back'],
  neck:                  ['neck'],
  traps:                 ['traps'],
}

// Cache en memoria para el dataset completo (se resetea al reiniciar el proceso)
let yuhonasCacheData: any[] | null = null
let yuhonasCacheTime = 0
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hora

async function getYuhonasCatalog(): Promise<any[]> {
  const now = Date.now()
  if (yuhonasCacheData && (now - yuhonasCacheTime) < CACHE_TTL_MS) {
    return yuhonasCacheData
  }
  // jsDelivr CDN mirror del repositorio de GitHub
  const url = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/dist/exercises.json'
  console.log('[exercises] Fetching yuhonas catalog...')
  const res = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`yuhonas catalog fetch failed: ${res.status}`)
  const data = await res.json()
  yuhonasCacheData = Array.isArray(data) ? data : []
  yuhonasCacheTime = now
  console.log(`[exercises] yuhonas catalog loaded: ${yuhonasCacheData.length} exercises`)
  return yuhonasCacheData
}

function yuhonasCDNImage(exerciseId: string, frame = 0): string {
  // jsDelivr sirve los archivos del repo directamente
  return `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${exerciseId}/images/${frame}.jpg`
}

async function fetchFromYuhonas(q: string, bodyPart: string, limit: number, offset: number): Promise<Exercise[] | null> {
  try {
    const catalog = await getYuhonasCatalog()
    const targetMuscles = bodyPart ? (YUHONAS_MUSCLE_MAP[bodyPart] ?? [bodyPart]) : []

    let filtered = catalog

    // Filtrar por músculo
    if (targetMuscles.length > 0) {
      filtered = catalog.filter((ex: any) => {
        const primary: string[] = ex.primaryMuscles ?? []
        const secondary: string[] = ex.secondaryMuscles ?? []
        return targetMuscles.some(m =>
          primary.some(p => p.toLowerCase().includes(m.toLowerCase())) ||
          secondary.some(s => s.toLowerCase().includes(m.toLowerCase()))
        )
      })
    }

    // Filtrar por nombre si hay query
    if (q) {
      filtered = filtered.filter((ex: any) =>
        ex.name?.toLowerCase().includes(q.toLowerCase())
      )
    }

    const page = filtered.slice(offset, offset + limit)

    if (page.length === 0) {
      console.log(`[exercises] yuhonas: 0 resultados para bodyPart="${bodyPart}"`)
      return null
    }

    console.log(`[exercises] yuhonas: ${page.length} ejercicios para "${bodyPart}", image: ${yuhonasCDNImage(page[0].id)}`)

    return page.map((ex: any): Exercise => {
      const images: string[] = ex.images ?? []
      const firstImageId = images[0]?.replace('/images/0.jpg', '') ?? ex.id
      return {
        id:                `yuhonas_${ex.id}`,
        name:              ex.name ?? 'Exercise',
        body_part:         (ex.primaryMuscles?.[0] ?? bodyPart ?? 'general'),
        equipment:         ex.equipment ?? 'body only',
        target_muscle:     ex.primaryMuscles?.[0] ?? bodyPart ?? '',
        secondary_muscles: ex.secondaryMuscles ?? [],
        gif_url:           null, // yuhonas no tiene GIFs
        image_url:         yuhonasCDNImage(ex.id, 0),
        instructions:      ex.instructions ?? [],
        source:            'yuhonas',
      }
    })
  } catch (err: any) {
    console.log(`[exercises] yuhonas error: ${err.message}`)
    return null
  }
}

/* ═══════════════════════════════════════════════════════════════
   FUENTE 2: ExerciseDB via RapidAPI
   Metadatos buenos, pero plan gratuito NO incluye gifUrl
   ═══════════════════════════════════════════════════════════════ */

async function fetchFromRapidAPI(q: string, bodyPart: string, limit: number, offset: number): Promise<Exercise[] | null> {
  const key = process.env.RAPIDAPI_EXERCISEDB_KEY
  if (!key) return null

  const BASE = 'https://exercisedb.p.rapidapi.com'
  const headers: Record<string, string> = {
    'x-rapidapi-key':  key,
    'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
  }

  let url: string
  if (bodyPart) {
    url = `${BASE}/exercises/target/${encodeURIComponent(bodyPart)}?limit=${limit}&offset=${offset}`
  } else if (q) {
    url = `${BASE}/exercises/name/${encodeURIComponent(q)}?limit=${limit}&offset=${offset}`
  } else {
    url = `${BASE}/exercises?limit=${limit}&offset=${offset}`
  }

  console.log(`[exercises] RapidAPI → ${url}`)
  const res = await fetch(url, { headers, cache: 'no-store', signal: AbortSignal.timeout(8000) })
  if (!res.ok) { console.log(`[exercises] RapidAPI ${res.status}`); return null }

  const data = await res.json()
  const raw: any[] = Array.isArray(data) ? data : (data.exercises ?? [])
  console.log(`[exercises] RapidAPI → ${raw.length} items`)

  const filtered = q && bodyPart
    ? raw.filter((e: any) => e.name?.toLowerCase().includes(q.toLowerCase()))
    : raw

  return filtered.slice(0, limit).map((e: any): Exercise => ({
    id:                e.id,
    name:              e.name,
    body_part:         e.bodyPart ?? '',
    equipment:         e.equipment ?? '',
    target_muscle:     e.target ?? '',
    secondary_muscles: e.secondaryMuscles ?? [],
    gif_url:           e.gifUrl ?? null, // null en plan gratuito
    image_url:         null,
    instructions:      e.instructions ?? [],
    source:            'rapidapi',
  }))
}

/* ═══════════════════════════════════════════════════════════════
   FUENTE 3: wger.de (fallback garantizado)
   ═══════════════════════════════════════════════════════════════ */

const WGER_BODY_MAP: Record<string, number> = {
  chest: 11, pectorals: 11, back: 12, lats: 12, shoulders: 13, delts: 13,
  'upper arms': 1, biceps: 1, triceps: 1, 'lower arms': 10, forearms: 10,
  'upper legs': 8, quads: 8, hamstrings: 8, glutes: 8,
  'lower legs': 14, calves: 14, waist: 10, abs: 10, cardio: 15, neck: 9,
}

async function fetchFromWger(q: string, bodyPart: string, limit: number): Promise<Exercise[]> {
  const params = new URLSearchParams({ format: 'json', language: '2', limit: String(limit * 2) })
  params.set('term', q || bodyPart || 'exercise')
  if (bodyPart && WGER_BODY_MAP[bodyPart]) params.set('category', String(WGER_BODY_MAP[bodyPart]))

  try {
    const res = await fetch(`https://wger.de/api/v2/exercise/search/?${params}`, { next: { revalidate: 86400 } })
    if (!res.ok) return []
    const data = await res.json()
    const suggestions: any[] = data.suggestions ?? []
    console.log(`[exercises] wger → ${suggestions.length} resultados`)

    return suggestions.slice(0, limit).map((s: any): Exercise => ({
      id:                String(s.data?.id ?? Math.random()),
      name:              s.value ?? s.data?.name ?? 'Exercise',
      body_part:         bodyPart || 'general',
      equipment:         s.data?.equipment?.[0] ?? 'bodyweight',
      target_muscle:     s.data?.muscles?.[0] ?? 'general',
      secondary_muscles: s.data?.muscles_secondary ?? [],
      gif_url:           null,
      image_url:         s.data?.image ?? null,
      instructions:      s.data?.description ? [s.data.description] : [],
      source:            'wger',
    }))
  } catch {
    return []
  }
}

/* ═══════════════════════════════════════════════════════════════
   Estrategia de merge: yuhonas para imágenes + RapidAPI para
   ejercicios adicionales sin imagen
   ═══════════════════════════════════════════════════════════════ */

async function fetchForMuscle(q: string, bp: string, limit: number): Promise<Exercise[]> {
  // 1. Intentar yuhonas (tiene imágenes JPG)
  const yuhonas = await fetchFromYuhonas(q, bp, limit, 0)
  if (yuhonas && yuhonas.length >= Math.ceil(limit * 0.5)) {
    // Tenemos suficientes con imágenes — complementar con RapidAPI si hay cupo
    if (yuhonas.length < limit) {
      const rapid = await fetchFromRapidAPI(q, bp, limit - yuhonas.length, 0).catch(() => null)
      if (rapid) {
        // Agregar RapidAPI que no estén ya por nombre
        const names = new Set(yuhonas.map(e => e.name.toLowerCase()))
        for (const ex of rapid) {
          if (!names.has(ex.name.toLowerCase())) yuhonas.push(ex)
          if (yuhonas.length >= limit) break
        }
      }
    }
    return yuhonas
  }

  // 2. Si yuhonas no devolvió suficiente, intentar RapidAPI
  const rapid = await fetchFromRapidAPI(q, bp, limit, 0).catch(() => null)
  if (rapid && rapid.length > 0) {
    // Mezclar: poner los de yuhonas (con imagen) primero
    const combined = [...(yuhonas ?? []), ...rapid]
    const seen = new Set<string>()
    return combined.filter(e => { const k = e.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true }).slice(0, limit)
  }

  // 3. wger como último recurso
  return await fetchFromWger(q, bp, limit)
}

/* ─── Handler principal ─── */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q        = searchParams.get('q')?.trim() ?? ''
  const bodyParts = (searchParams.get('bodyParts') ?? searchParams.get('bodyPart') ?? '')
    .split(',').map(s => s.trim()).filter(Boolean)
  const limit    = Math.min(Number(searchParams.get('limit') ?? 24), 50)
  const offset   = Number(searchParams.get('offset') ?? 0)

  if (!q && bodyParts.length === 0) {
    return NextResponse.json({ exercises: [], total: 0 })
  }

  try {
    console.log(`[exercises] ─── q="${q}" bodyParts=${JSON.stringify(bodyParts)}`)

    let allResults: Exercise[] = []

    if (bodyParts.length > 0) {
      const perPart = Math.ceil(limit / bodyParts.length)
      const fetches = await Promise.all(bodyParts.map(bp => fetchForMuscle(q, bp, perPart)))

      const seen = new Set<string>()
      for (const chunk of fetches) {
        for (const ex of chunk) {
          if (!seen.has(ex.id)) { seen.add(ex.id); allResults.push(ex) }
        }
      }
    } else {
      // Solo búsqueda por nombre
      const yuhonas = await fetchFromYuhonas(q, '', limit, offset)
      if (yuhonas && yuhonas.length > 0) { allResults = yuhonas }
      else {
        const rapid = await fetchFromRapidAPI(q, '', limit, offset).catch(() => null)
        if (rapid && rapid.length > 0) { allResults = rapid }
        else { allResults = await fetchFromWger(q, '', limit) }
      }
    }

    if (q && bodyParts.length > 0) {
      allResults = allResults.filter(e => e.name?.toLowerCase().includes(q.toLowerCase()))
    }

    const withImage = allResults.filter(e => e.gif_url || e.image_url).length
    console.log(`[exercises] ─── total: ${allResults.length}, con imagen: ${withImage}`)

    return NextResponse.json({ exercises: allResults.slice(0, limit), total: allResults.length })
  } catch (err: any) {
    console.error('[/api/exercises]', err)
    return NextResponse.json({ exercises: [], total: 0, error: 'Error buscando ejercicios.' }, { status: 502 })
  }
}

/* ─── POST: listas de filtros ─── */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.type === 'bodyParts') {
    return NextResponse.json({
      items: ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist']
    })
  }
  return NextResponse.json({ items: [] })
}
