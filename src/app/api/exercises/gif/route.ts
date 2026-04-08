/**
 * /api/exercises/gif?url=<encoded>
 * Proxy server-side para las imágenes de ExerciseDB.
 * Los GIFs de exercisedb.io requieren el header x-rapidapi-key para cargarse.
 * El browser no puede enviar ese header directamente, así que lo hacemos desde el server.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url', { status: 400 })

  // Solo permitimos URLs de dominios conocidos de ejercicios
  const allowed = ['exercisedb.io', 'wger.de', 'exercisedb.dev', 'exercisedb.p.rapidapi.com']
  const isAllowed = allowed.some(domain => url.includes(domain))
  if (!isAllowed) return new NextResponse('Domain not allowed', { status: 403 })

  try {
    const headers: HeadersInit = { Accept: 'image/gif, image/*, */*' }

    // Agregar key de RapidAPI si la URL es de exercisedb.io
    const key = process.env.RAPIDAPI_EXERCISEDB_KEY
    if (key && url.includes('exercisedb.io')) {
      headers['x-rapidapi-key']  = key
      headers['x-rapidapi-host'] = 'exercisedb.p.rapidapi.com'
    }

    const res = await fetch(url, { headers, next: { revalidate: 60 * 60 * 24 * 7 } }) // cache 7 días

    if (!res.ok) {
      return new NextResponse(null, { status: res.status })
    }

    const contentType = res.headers.get('content-type') ?? 'image/gif'
    const buffer = await res.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':  contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    })
  } catch (err) {
    console.error('[/api/exercises/gif]', err)
    return new NextResponse(null, { status: 502 })
  }
}
