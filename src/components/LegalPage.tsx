import Image from 'next/image'
import Link from 'next/link'
import { legalContent } from '@/data/legal-content'

export default function LegalPage({ locale, kind }: { locale: string; kind: 'privacy' | 'terms' }) {
  const lang = locale === 'en' ? 'en' : 'es'
  const content = legalContent[lang]
  const doc = content[kind]

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white font-body">
      <header className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} aria-label="Ale Gerez Coach">
            <Image src="/images/ale/ag_loader.png" alt="Ale Gerez" width={72} height={48} className="h-12 w-auto" />
          </Link>
          <Link
            href={`/${locale}`}
            className="font-label text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors duration-300"
          >
            ← {content.back}
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <h1 className="font-headline font-black uppercase tracking-tighter text-4xl md:text-5xl leading-none text-[#c1ed00]">
          {doc.title}
        </h1>
        <p className="mt-3 font-label text-[11px] uppercase tracking-widest text-white/40">{doc.updated}</p>
        <p className="mt-8 text-white/70 leading-relaxed">{doc.intro}</p>

        <div className="mt-10 space-y-10">
          {doc.sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-headline font-bold uppercase tracking-tight text-lg md:text-xl text-white">{s.title}</h2>
              <div className="mt-3 space-y-3 text-white/65 leading-relaxed">
                {s.body?.map((p, i) => <p key={i}>{p}</p>)}
                {s.list && (
                  <ul className="list-disc pl-5 space-y-2 marker:text-[#c1ed00]">
                    {s.list.map((li, i) => <li key={i}>{li}</li>)}
                  </ul>
                )}
                {s.after?.map((p, i) => <p key={`a${i}`}>{p}</p>)}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
