'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EvaluacionPage({
  params,
}: {
  params: { locale: string }
}) {
  const router = useRouter()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [skipMedidas, setSkipMedidas] = useState(false)
  const [objetivo, setObjetivo] = useState('')
  const [situacion, setSituacion] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#c1ed00]/50 transition-colors"
  const labelClass = "block text-xs font-black uppercase tracking-wider text-white/50 mb-1.5"

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white px-4 py-12">
      {/* Ambient */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#c1ed00]/5 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#c1ed00] mb-4">
            Método R3SET
          </p>
          <h1 className="font-headline text-4xl sm:text-5xl font-black tracking-tighter uppercase mb-4">
            Contanos sobre vos
          </h1>
          <p className="text-white/50 text-base leading-relaxed">
            Esta información me ayudará a evaluar tu caso.
          </p>
        </div>

        {/* Dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna izquierda — formulario (2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
              <div className="flex flex-col gap-5">

                {/* Nombre */}
                <div>
                  <label className={labelClass}>Nombre completo</label>
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" className={inputClass} />
                </div>

                {/* Email */}
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className={inputClass} />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className={labelClass}>WhatsApp / Teléfono</label>
                  <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+54 9 11 1234 5678" className={inputClass} />
                </div>

                {/* Ciudad */}
                <div>
                  <label className={labelClass}>¿Desde qué ciudad y país escribís?</label>
                  <input type="text" value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Ej: Buenos Aires, Argentina" className={inputClass} />
                </div>

                {/* Peso y Altura */}
                <div className={`grid grid-cols-2 gap-4 transition-opacity ${skipMedidas ? 'opacity-40' : 'opacity-100'}`}>
                  <div>
                    <label className={labelClass}>¿Cuánto pesás? (kg)</label>
                    <input type="number" value={peso} onChange={e => setPeso(e.target.value)} placeholder="Ej: 75" className={inputClass} disabled={skipMedidas} />
                  </div>
                  <div>
                    <label className={labelClass}>¿Cuánto medís? (cm)</label>
                    <input type="number" value={altura} onChange={e => setAltura(e.target.value)} placeholder="Ej: 175" className={inputClass} disabled={skipMedidas} />
                  </div>
                </div>

                {/* Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={skipMedidas}
                      onChange={e => { setSkipMedidas(e.target.checked); if (e.target.checked) { setPeso(''); setAltura('') } }}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${skipMedidas ? 'bg-[#c1ed00] border-[#c1ed00]' : 'border-white/20 bg-white/5 group-hover:border-white/40'}`}>
                      {skipMedidas && (
                        <svg className="w-3 h-3 text-[#0e0e0e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-white/50 leading-snug group-hover:text-white/70 transition-colors">
                    Prefiero compartir mi peso y altura en la videollamada con Ale
                  </span>
                </label>

                {/* Objetivo */}
                <div>
                  <label className={labelClass}>¿Cuál es tu objetivo principal?</label>
                  <select
                    value={objetivo}
                    onChange={e => setObjetivo(e.target.value)}
                    className={`${inputClass} appearance-none`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                  >
                    <option value="" disabled className="bg-[#1a1a1a]">Seleccioná tu objetivo</option>
                    <option value="bajar" className="bg-[#1a1a1a]">Bajar de peso</option>
                    <option value="muscular" className="bg-[#1a1a1a]">Ganar masa muscular</option>
                    <option value="habitos" className="bg-[#1a1a1a]">Mejorar hábitos</option>
                    <option value="recomp" className="bg-[#1a1a1a]">Recomposición corporal</option>
                    <option value="otro" className="bg-[#1a1a1a]">Otro</option>
                  </select>
                </div>

                {/* Situación actual */}
                <div>
                  <label className={labelClass}>Contanos brevemente tu situación actual</label>
                  <textarea
                    value={situacion}
                    onChange={e => setSituacion(e.target.value)}
                    placeholder="Escribí tu mensaje..."
                    rows={5}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Términos */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${termsAccepted ? 'bg-[#c1ed00] border-[#c1ed00]' : 'border-white/20 bg-white/5 group-hover:border-white/40'}`}>
                      {termsAccepted && (
                        <svg className="w-3 h-3 text-[#0e0e0e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-white/50 leading-snug group-hover:text-white/70 transition-colors">
                    He leído y acepto los{' '}
                    <a href={`/${params.locale}`} className="text-[#c1ed00] underline hover:text-white transition-colors">
                      términos y condiciones
                    </a>
                  </span>
                </label>

                {/* Error */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-red-400 text-sm leading-snug">{error}</p>
                  </div>
                )}

                {/* Botón */}
                <button
                  onClick={async () => {
                    if (!termsAccepted || loading) return
                    setError(null)
                    setLoading(true)
                    try {
                      const res = await fetch('/api/evaluacion', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nombre, email, whatsapp, ciudad, peso, altura, skipMedidas, objetivo, situacion }),
                      })
                      const data = await res.json()
                      if (!res.ok) {
                        setError(data.error ?? 'Ocurrió un error. Intentá de nuevo.')
                        setLoading(false)
                        return
                      }
                      router.push(`/${params.locale}/evaluacion/gracias`)
                    } catch {
                      setError('Error de conexión. Verificá tu internet e intentá de nuevo.')
                      setLoading(false)
                    }
                  }}
                  disabled={!termsAccepted || loading}
                  className="w-full py-4 rounded-xl font-headline font-black text-sm bg-[#c1ed00] text-[#0e0e0e] hover:bg-[#d4ff00] transition-all uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(193,237,0,0.3)] disabled:hover:shadow-none"
                >
                  {loading ? 'ENVIANDO...' : 'ENVIAR SOLICITUD →'}
                </button>

              </div>
            </div>
          </div>

          {/* Columna derecha — panel lateral (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 sticky top-8">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#c1ed00] mb-8">
                ¿Qué pasa después?
              </p>
              <div className="flex flex-col gap-7">
                {[
                  'Reviso personalmente tu formulario.',
                  'Te contacto por el medio que prefieras.',
                  'Agendamos una charla personalizada para conocerte y analizar tu caso.',
                  'Voy a explicarte el plan ideal para vos.',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#c1ed00]/15 border border-[#c1ed00]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-[#c1ed00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white/60 text-base leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
