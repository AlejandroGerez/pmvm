/**
 * POST /api/admin/seed-exercises
 *
 * Seed the local `exercises` table from Ascend API via RapidAPI (EDB v1).
 * Strategy: fetch once, store GIFs in Supabase Storage, never call API again.
 *
 * Usage:
 *   curl -X POST https://your-domain/api/admin/seed-exercises \
 *     -H "Content-Type: application/json" \
 *     -H "x-admin-secret: YOUR_ADMIN_SECRET" \
 *     -d '{"offset": 0, "limit": 20, "downloadGifs": true}'
 *
 * Env vars needed:
 *   RAPIDAPI_KEY           — your RapidAPI key (x-rapidapi-key header)
 *   ADMIN_SECRET           — secret to protect this endpoint
 *   SUPABASE_SECRET_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *
 * RapidAPI product: "EDB with Videos and Images by AscendAPI"
 * Host: edb-with-videos-and-images-by-ascendapi.p.rapidapi.com
 *
 * Response shape (v1 via RapidAPI): plain array of exercise objects
 *   [{ id, name, bodyPart, equipment, target, secondaryMuscles[], gifUrl, instructions[] }]
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 min — Vercel Pro/hobby limits apply

const RAPIDAPI_HOST = 'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com'
const RAPIDAPI_BASE = `https://${RAPIDAPI_HOST}`
const STORAGE_BUCKET = 'exercise-media'

// Admin Supabase client (bypasses RLS)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

// Download a GIF URL and upload to Supabase Storage
async function storeGif(supabase: ReturnType<typeof getAdminClient>, exerciseId: string, gifUrl: string): Promise<string | null> {
  try {
    const res = await fetch(gifUrl, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) return gifUrl // fallback: keep original URL

    const buffer = await res.arrayBuffer()
    const path = `gifs/${exerciseId}.gif`

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType: 'image/gif',
        upsert: true,
      })

    if (error) {
      console.error(`Storage error for ${exerciseId}:`, error.message)
      return gifUrl // fallback to original
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path)

    return publicUrl
  } catch (e) {
    console.warn(`Could not store GIF for ${exerciseId}:`, e)
    return gifUrl // fallback to original
  }
}

export async function POST(req: NextRequest) {
  // Auth check
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY
  if (!rapidApiKey) {
    return NextResponse.json({ error: 'RAPIDAPI_KEY not configured' }, { status: 500 })
  }

  const body = await req.json().catch(() => ({}))
  const offset = Number(body.offset ?? 0)
  // Keep limit low (10-20) — RapidAPI free tier has rate limits and GIF downloads are slow
  const limit = Number(body.limit ?? 20)
  const downloadGifs = body.downloadGifs !== false // default: true

  const supabase = getAdminClient()

  // 1. Fetch batch from RapidAPI (EDB by AscendAPI v1)
  // Endpoint: GET /api/v1/exercises?offset=N&limit=N
  const apiUrl = `${RAPIDAPI_BASE}/api/v1/exercises?offset=${offset}&limit=${limit}`
  const apiRes = await fetch(apiUrl, {
    headers: {
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': rapidApiKey,
      'Content-Type': 'application/json',
    },
  })

  if (!apiRes.ok) {
    const errText = await apiRes.text()
    return NextResponse.json({ error: `RapidAPI error: ${apiRes.status}`, detail: errText }, { status: 500 })
  }

  const apiData = await apiRes.json()

  // RapidAPI v1 shape: plain array OR { exercises: [...], total: N }
  // Handle both cases
  const rawExercises: any[] = Array.isArray(apiData)
    ? apiData
    : (apiData.exercises ?? apiData.data ?? [])
  const total: number = Array.isArray(apiData)
    ? rawExercises.length  // v1 doesn't always return total — we'll iterate until empty
    : (apiData.total ?? rawExercises.length)

  const results = { inserted: 0, updated: 0, errors: 0 }

  for (const ex of rawExercises) {
    try {
      // Map Ascend fields → our schema
      // Adjust field names if Ascend v2 uses different keys
      let gifUrl: string | null = ex.gifUrl ?? ex.gif_url ?? ex.gif ?? null

      // Download and store GIF in our own storage
      if (downloadGifs && gifUrl) {
        gifUrl = await storeGif(supabase, ex.id, gifUrl)
      }

      const record = {
        id:                String(ex.id),
        name:              ex.name ?? ex.exercise_name ?? '',
        body_part:         ex.bodyPart ?? ex.body_part ?? ex.bodypart ?? null,
        equipment:         ex.equipment ?? null,
        target_muscle:     ex.target ?? ex.target_muscle ?? null,
        secondary_muscles: ex.secondaryMuscles ?? ex.secondary_muscles ?? [],
        gif_url:           gifUrl,
        instructions:      ex.instructions ?? [],
        source:            'api',
        is_active:         true,
      }

      const { error } = await supabase
        .from('exercises')
        .upsert(record, { onConflict: 'id' })

      if (error) {
        console.error(`Upsert error for ${ex.id}:`, error.message)
        results.errors++
      } else {
        results.inserted++
      }
    } catch (e) {
      console.error('Exercise processing error:', e)
      results.errors++
    }
  }

  const nextOffset = offset + rawExercises.length
  const isDone = rawExercises.length < limit // fetched fewer than limit → we've hit the end

  return NextResponse.json({
    ok: true,
    batch: { offset, limit, fetched: rawExercises.length },
    total,
    nextOffset,
    done: isDone,
    results,
    tip: isDone
      ? '✅ All exercises seeded! (fetched less than limit — end of dataset)'
      : `Run again with offset: ${nextOffset} to continue seeding`,
  })
}

// GET → status / count
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()
  const { count } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true })

  const { count: gifCount } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true })
    .not('gif_url', 'is', null)
    .ilike('gif_url', `%${process.env.NEXT_PUBLIC_SUPABASE_URL}%`)

  return NextResponse.json({
    total_exercises: count,
    gifs_stored_locally: gifCount,
    gifs_external: (count ?? 0) - (gifCount ?? 0),
  })
}
