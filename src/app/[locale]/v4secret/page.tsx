'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useMemo, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import V4SplashManager from '@/components/v4/V4SplashScreen'
import { Menu, X, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, LogOut, LayoutDashboard, Brain, Dumbbell, Sparkles, Zap, UserPlus, ArrowRight, Check, Plus, Utensils, Shield, MessageCircle, Mail, Share2, Megaphone, Award } from 'lucide-react'
import { PHONE_NUMBER } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import transformations from '@/data/transformations.json'
import {
  Carousel,
  CarouselItem,
  CarouselContent,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
} from '@/components/ui/carousel'

interface ActiveSub { plan_id: string }

/* ── Pricing Card ──────────────────────────────────────────── */
function PricingCard({ plan, locale, activeSub }: { plan: any; locale: string; activeSub: ActiveSub | null }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const isMentoria = plan.id === 'mentoria'
  const isCurrent = activeSub?.plan_id === plan.id

  const handleBuy = () => {
    if (isMentoria) {
      router.push(`/${locale}/evaluacion`)
    } else {
      router.push(`/${locale}/checkout?plan=${plan.id}`)
    }
  }

  return (
    <div className={`pricing-card-inner relative flex flex-col h-full rounded-none p-5 lg:p-8 border transition-all duration-300 ${
      isMentoria
        ? 'mentoria-holographic border-[#ff734a]/40 bg-[#ff734a]/[0.04] hover:border-[#ff734a]/60'
        : 'border-[#c1ed00]/30 bg-[#c1ed00]/[0.03] hover:border-[#c1ed00]/50 hover:-translate-y-1'
    }`}>
      {/* Shimmer layer — solo mentoría */}
      {isMentoria && <div className="mentoria-shimmer-layer" aria-hidden="true" />}

      {/* Badge */}
      {isCurrent ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-black tracking-widest font-label uppercase bg-white text-[#0e0e0e] whitespace-nowrap">
          TU PLAN ACTUAL
        </div>
      ) : plan.badge ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1.5 text-xs font-black tracking-widest font-label uppercase whitespace-nowrap overflow-visible z-10"
          style={{ backgroundColor: plan.color, color: '#0e0e0e' }}>
          {plan.badge}
        </div>
      ) : null}

      {/* Label */}
      <p className="font-label text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1 md:mb-2" style={{ color: plan.color }}>
        {isMentoria ? 'ACOMPAÑAMIENTO PERSONALIZADO' : 'ACCESO INMEDIATO'}
      </p>
      <h3 className="font-headline text-xl md:text-2xl font-black mb-1 md:mb-3">{plan.name}</h3>

      {isMentoria && (
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-headline text-3xl md:text-4xl font-black text-white leading-none">100%</span>
          <span className="font-headline text-lg md:text-xl font-black text-white/40 tracking-tight">personalizado</span>
        </div>
      )}

      {isMentoria && (
        <p className="hidden md:block text-[11px] text-white/30 font-label uppercase tracking-widest mb-3">
          Diseñado exclusivamente para vos.
        </p>
      )}

      {isMentoria && (
        <p className="md:block text-xs md:text-sm leading-relaxed mb-0 md:mb-6 font-body font-bold text-on-surface-variant whitespace-nowrap">Mi nivel más alto de acompañamiento.</p>
      )}

      {/* Price */}
      {!isMentoria && (
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-xs md:text-sm text-white/40 font-label">Desde ARS</span>
          <span className="font-headline text-3xl md:text-4xl font-black">${plan.price.toLocaleString('es-AR')}</span>
          <span className="text-xs md:text-sm text-white/40 font-label">/mes</span>
        </div>
      )}
      {plan.priceNote && (
        <p className="md:block text-[10px] text-white/30 font-label uppercase tracking-widest mb-1 md:mb-3 whitespace-nowrap">
          {plan.priceNote}
        </p>
      )}

      {!isMentoria && <p className="hidden md:block text-on-surface-variant text-sm leading-relaxed mb-4 md:mb-6 font-body font-bold">{plan.desc}</p>}

      <div className="min-h-[1.5rem] mt-1.5 md:mt-0 mb-1">
        {isMentoria ? (
          <p className="text-[10px] md:text-[11px] font-black font-label uppercase tracking-widest text-[#ff734a]">
            Incluye lo del Plan Base y además:
          </p>
        ) : (
          <p className="text-[10px] md:text-[11px] font-black font-label uppercase tracking-widest" style={{ color: plan.color }}>
            El Plan Base incluye:
          </p>
        )}
      </div>

      <ul className={`space-y-1.5 md:space-y-2.5 mb-3 md:mb-8 ${isMentoria ? 'flex-1' : ''}`}>
        {(() => {
          let pastComplementa = false
          return plan.features.map((f: any, i: number) => {
            if (typeof f === 'object' && f.section) pastComplementa = true
            const hide = pastComplementa
            return typeof f === 'object' && f.section ? (
              <li key={i} className="pt-1.5 pb-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 font-label">{f.section}</span>
              </li>
            ) : (
              <li key={i} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm font-body">
                <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                <span className={typeof f === 'object' && f.bold ? 'font-bold text-white' : 'text-on-surface-variant'}>
                  {typeof f === 'object' ? f.text : f}
                  {typeof f === 'object' && f.sub && (
                    <><br /><span className="whitespace-nowrap">{f.sub}</span></>
                  )}
                </span>
              </li>
            )
          })
        })()}
      </ul>

      {!isMentoria && (
        <p className="hidden md:block text-[11px] font-black font-label uppercase tracking-widest mb-4 px-3 py-2 bg-[#c1ed00]/15 text-[#c1ed00] border border-[#c1ed00]/40 text-center">
          El primer paso es el más importante.
        </p>
      )}

      {!isMentoria && <div className="flex-1" />}


      {error && <p className="text-red-400 text-xs mb-3 text-center bg-red-400/10 rounded py-2 px-3 font-label">{error}</p>}

      <button onClick={handleBuy} disabled={loading}
        className={`w-full py-2.5 md:py-3.5 font-headline font-black text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.05] active:scale-[0.98] ${isMentoria ? 'hover:shadow-[0_0_20px_rgba(255,115,74,0.5)]' : 'hover:shadow-[0_0_20px_rgba(193,237,0,0.5)]'}`}
        style={{
          backgroundColor: loading ? '#333' : plan.color,
          color: '#0e0e0e',
          boxShadow: loading ? 'none' : isMentoria ? '0 0 20px rgba(255,115,74,0.5)' : '0 0 20px rgba(193,237,0,0.5)',
        }}>
        {loading ? 'PROCESANDO...' : isMentoria ? 'SOLICITAR EVALUACIÓN' : isCurrent ? 'RENOVAR PLAN' : 'EMPEZAR HOY'}
      </button>
    </div>
  )
}

/* ── Transformations Carousel Inner (mobile dim + dots + modal) ── */
function TransformationCarouselContent({ locale }: { locale: string }) {
  const { api } = useCarousel()
  const [current, setCurrent] = useState(0)
  const [modalItem, setModalItem] = useState<typeof transformations[0] | null>(null)

  useEffect(() => {
    if (!api) return
    if (window.innerWidth < 768) {
      const rominaIndex = transformations.findIndex(t => t.clientName === 'Romina')
      if (rominaIndex > 0) api.scrollTo(rominaIndex, true)
    }
    setCurrent(api.selectedScrollSnap())
    api.on('select', () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  return (
    <>
      <CarouselContent className="flex gap-6">
        {(() => {
          const NEEDS_ZOOM = ['Romina', 'Joha', 'Laura', 'Ana', 'Manu', 'Jose', 'Victor']
          return transformations.map((item, index) => {
          const quote = item.clientDetail?.[locale as 'es' | 'en' | 'pt'] ?? item.clientDetail?.es ?? ''
          const isActive = index === current
          const needsZoom = NEEDS_ZOOM.includes(item.clientName)
          return (
            <CarouselItem
              key={item.clientName}
              className={`basis-[78%] md:basis-1/2 lg:basis-1/3 flex-shrink-0 transition-opacity duration-300 ${
                !isActive ? 'opacity-35 md:opacity-100' : 'opacity-100'
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="grid grid-cols-2 gap-1 mb-3 md:mb-6 group overflow-hidden md:cursor-default cursor-pointer" onClick={() => setModalItem(item)}>
                  <div className="relative overflow-hidden aspect-[2/3] md:aspect-[4/5] bg-surface-container">
                    <Image
                      alt={`${item.clientName} - Antes`}
                      className={`object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 ${needsZoom ? 'scale-125' : ''}`}
                      src={item.beforeImage}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#0e0e0e]/85 px-3 py-0.5 text-[8px] font-bold uppercase tracking-widest border-t border-white/10 font-label whitespace-nowrap">
                      Antes
                    </div>
                  </div>
                  <div className="relative overflow-hidden aspect-[2/3] md:aspect-[4/5] bg-surface-container">
                    <Image
                      alt={`${item.clientName} - Después`}
                      className={`object-cover ${needsZoom ? 'scale-125' : ''}`}
                      src={item.afterImage}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#c1ed00] text-[#0e0e0e] px-3 py-0.5 text-[8px] font-bold uppercase tracking-widest font-label whitespace-nowrap">
                      Después
                    </div>
                  </div>
                </div>
                <div className="border-l-2 border-[#c1ed00] pl-4 md:pl-6 py-1 md:py-2 flex-1">
                  <h4 className="font-headline text-lg md:text-2xl font-bold uppercase tracking-tight text-white mb-1 md:mb-2 md:cursor-default cursor-pointer" onClick={() => setModalItem(item)}>
                    {item.clientName}
                  </h4>
                  <blockquote className="font-body text-on-surface-variant italic text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none md:cursor-default cursor-pointer" onClick={() => setModalItem(item)}>
                    {quote}
                  </blockquote>
                  <button
                    onClick={() => setModalItem(item)}
                    className="md:hidden mt-1 text-[#c1ed00] text-[8px] font-label font-bold uppercase tracking-widest"
                  >
                    Ver más →
                  </button>
                </div>
              </div>
            </CarouselItem>
          )
        })})()}
      </CarouselContent>

      <div className="hidden md:flex justify-between items-center mt-8">
        <CarouselPrevious className="static translate-x-0 translate-y-0" />
        <CarouselNext className="static translate-x-0 translate-y-0" />
      </div>
      <div className="flex md:hidden justify-center items-center gap-3 mt-5">
        <button onClick={() => api?.scrollPrev()} className="text-white/30 hover:text-white/60 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-1.5">
          {transformations.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-[#c1ed00]' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
        <button onClick={() => api?.scrollNext()} className="text-white/30 hover:text-white/60 transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal — solo mobile */}
      <AnimatePresence>
        {modalItem && (
          <motion.div
            className="md:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalItem(null)}
          >
            <motion.div
              className="relative bg-[#0e0e0e] border border-white/10 w-full max-w-sm max-h-[88vh] overflow-y-auto"
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.82, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fotos */}
              <div className="grid grid-cols-2 gap-1">
                <div className="relative aspect-[3/4]">
                  <Image src={modalItem.beforeImage} alt="Antes" fill className={`object-cover ${['Romina','Joha','Laura','Ana','Manu','Jose','Victor'].includes(modalItem.clientName) ? 'scale-125' : ''}`} />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#0e0e0e]/85 px-3 py-0.5 text-[8px] font-bold uppercase tracking-widest border-t border-white/10 font-label whitespace-nowrap">Antes</div>
                </div>
                <div className="relative aspect-[3/4]">
                  <Image src={modalItem.afterImage} alt="Después" fill className={`object-cover ${['Romina','Joha','Laura','Ana','Manu','Jose','Victor'].includes(modalItem.clientName) ? 'scale-125' : ''}`} />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#c1ed00] text-[#0e0e0e] px-3 py-0.5 text-[8px] font-bold uppercase tracking-widest font-label whitespace-nowrap">Después</div>
                </div>
              </div>
              {/* Texto */}
              <div className="p-5 border-l-2 border-[#c1ed00] ml-5 my-5">
                <h4 className="font-headline text-xl font-bold uppercase tracking-tight text-white mb-2">
                  {modalItem.clientName}
                </h4>
                <blockquote className="font-body text-on-surface-variant italic text-sm leading-relaxed">
                  {modalItem.clientDetail?.[locale as 'es' | 'en' | 'pt'] ?? modalItem.clientDetail?.es}
                </blockquote>
              </div>
              {/* Cerrar */}
              <button
                onClick={() => setModalItem(null)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/60 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Animation variants ────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const PLAN_NAMES: Record<string, string> = {
  monthly:    'Plan Base',
  quarterly:  'Plan Trimestral',
  semiannual: 'Plan Semestral',
  mentoria:   'Mentoría 1 a 1',
}

/* ── FAQ Item ──────────────────────────────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="py-2.5 md:py-5">
      <button
        className="w-full flex items-start justify-between gap-4 text-left group"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-headline font-bold text-[11px] md:text-base lg:text-lg uppercase tracking-tight group-hover:text-[#c1ed00] transition-colors duration-200">
          {question}
        </span>
        <Plus className={`w-3.5 h-3.5 md:w-5 md:h-5 flex-shrink-0 text-white/30 transition-transform duration-300 mt-0.5 ${open ? 'rotate-45' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="font-body text-on-surface-variant text-[10px] md:text-sm leading-relaxed pt-2 md:pt-4 max-w-2xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const COACH_PHOTOS = [
  { src: '/images/ale/ale-cuerpo.jpg', alt: 'Alejandro Gerez — transformación corporal' },
  { src: '/images/ale/ale-cara.jpg', alt: 'Alejandro Gerez — antes y después' },
  { src: '/images/ale/ale-vida.jpg', alt: 'Alejandro Gerez — coach' },
]

export default function V4Page() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'es'
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // Auth
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Pillars slider (mobile)
  const pillarRef = useRef<HTMLDivElement>(null)
  const [pillarSlide, setPillarSlide] = useState(0)
  const [pillarRatio, setPillarRatio] = useState(0)
  const handlePillarScroll = () => {
    if (!pillarRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = pillarRef.current
    const maxScroll = scrollWidth - clientWidth
    const ratio = maxScroll > 0 ? scrollLeft / maxScroll : 0
    setPillarRatio(ratio)
    setPillarSlide(Math.min(2, Math.max(0, Math.round(ratio * 2))))
  }
  const pillarColors = ['#ff734a', '#c1ed00', '#00e3fd']

  // Pricing carousel (mobile)
  const pricingRef = useRef<HTMLDivElement>(null)
  const [pricingSlide, setPricingSlide] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const handlePricingScroll = () => {
    if (!pricingRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = pricingRef.current
    const maxScroll = scrollWidth - clientWidth
    setPricingSlide(maxScroll > 0 && scrollLeft > maxScroll / 2 ? 1 : 0)
  }

  // Mentoría active state (mobile IntersectionObserver)
  const mentoriaCardRef = useRef<HTMLDivElement>(null)
  const [mentoriaActive, setMentoriaActive] = useState(false)
  useEffect(() => {
    const el = mentoriaCardRef.current
    const root = pricingRef.current
    if (!el || !root) return
    const observer = new IntersectionObserver(
      ([entry]) => setMentoriaActive(entry.isIntersecting),
      { root, threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Active subscription
  const [activeSub, setActiveSub] = useState<ActiveSub | null>(null)

  // Coach carousel (mobile)
  const [coachSlide, setCoachSlide] = useState(0)
  const [coachDir, setCoachDir] = useState(1)
  useEffect(() => {
    const t = setInterval(() => {
      setCoachDir(1)
      setCoachSlide(prev => (prev + 1) % COACH_PHOTOS.length)
    }, 3500)
    return () => clearInterval(t)
  }, [])

  // Scroll
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3])
  const [navSolid, setNavSolid] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setAuthLoading(false)
      if (user) {
        supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(({ data }) => setActiveSub(data))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => {
      setNavSolid(v > 80)
      if (v > 80) setMobileMenuOpen(false)
    })
    return unsub
  }, [scrollY])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
    router.refresh()
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? ''
  const initial = displayName[0]?.toUpperCase() ?? 'U'

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href')
    if (!href?.startsWith('#')) return
    e.preventDefault()
    setMobileMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <V4SplashManager>
      {/* ── Top Nav ───────────────────────────────────────────────── */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          navSolid ? 'bg-[#0e0e0e]/95 backdrop-blur-xl shadow-[0_4px_40px_rgba(0,0,0,0.6)]' : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 h-16">
          {/* Logo */}
          <span className="font-headline font-black text-base tracking-widest uppercase text-[#c1ed00]">MÉTODO R3SET</span>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#method" onClick={smoothScroll} className="font-label text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors duration-300">Método</a>
            <a href="#coach" onClick={smoothScroll} className="font-label text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors duration-300">Coach</a>
            <a href="#transformations" onClick={smoothScroll} className="font-label text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors duration-300">Transformaciones</a>
            <a href="#pricing" onClick={smoothScroll} className="font-label text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors duration-300">Programas</a>
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {!authLoading && (
              user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 border border-white/15 hover:border-[#c1ed00]/40 px-2.5 py-1.5 rounded transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#c1ed00] flex items-center justify-center text-[#0e0e0e] font-black text-[11px]">
                      {initial}
                    </div>
                    <span className="text-[11px] font-semibold text-white/70 max-w-[90px] truncate">{displayName}</span>
                    <ChevronDown className="w-3 h-3 text-white/30" />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                        <motion.div
                          className="absolute right-0 top-full mt-2 w-48 bg-[#161616] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl"
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                        >
                          {activeSub && (
                            <div className="px-4 py-2 border-b border-white/8">
                              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Plan activo</p>
                              <p className="text-xs text-[#c1ed00] font-bold">{PLAN_NAMES[activeSub.plan_id] ?? activeSub.plan_id}</p>
                            </div>
                          )}
                          <Link href={`/${locale}/dashboard`} onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> Mi Dashboard
                          </Link>
                          <div className="border-t border-white/8" />
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-colors">
                            <LogOut className="w-4 h-4" /> Cerrar sesión
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a href="#pricing" onClick={smoothScroll}
                  className="bg-[#cefc22] text-[#3b4a00] px-5 py-2 font-headline font-bold text-xs tracking-widest uppercase hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(193,237,0,0.5)] active:scale-[0.98] transition-all duration-300">
                  Comenzar
                </a>
              )
            )}
          </div>

          {/* Mobile: auth indicator + burger */}
          <div className="md:hidden flex items-center gap-3">
            {!authLoading && user && (
              <div className="w-7 h-7 rounded-full bg-[#c1ed00] flex items-center justify-center text-[#0e0e0e] font-black text-[11px]">
                {initial}
              </div>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white/70 hover:text-[#c1ed00] transition-colors p-1">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden absolute top-full left-0 right-0 bg-[#0e0e0e] border-t border-white/8 overflow-y-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-6 py-4 flex flex-col gap-3">
                {/* Nav links */}
                {[
                  { href: '#method', label: 'Método' },
                  { href: '#coach', label: 'Coach' },
                  { href: '#transformations', label: 'Transformaciones' },
                  { href: '#pricing', label: 'Programas' },
                ].map(({ href, label }) => (
                  <a key={href} href={href} onClick={smoothScroll}
                    className="text-xs font-bold tracking-[0.2em] uppercase text-white/60 hover:text-[#c1ed00] transition-colors py-1">
                    {label}
                  </a>
                ))}

                <div className="border-t border-white/8 pt-3">
                  {!authLoading && (
                    user ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-full bg-[#c1ed00] flex items-center justify-center text-[#0e0e0e] font-black text-xs">
                            {initial}
                          </div>
                          <div>
                            <p className="text-white text-xs font-bold truncate max-w-[180px]">{displayName}</p>
                            {activeSub && (
                              <p className="text-[9px] text-[#c1ed00]/70 uppercase tracking-widest">{PLAN_NAMES[activeSub.plan_id] ?? activeSub.plan_id} activo</p>
                            )}
                          </div>
                        </div>
                        <Link href={`/${locale}/dashboard`} onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-2 py-2 border border-white/15 text-xs font-bold tracking-widest uppercase text-white/70 hover:text-white rounded">
                          <LayoutDashboard className="w-3.5 h-3.5" /> Mi Dashboard
                        </Link>
                        <button onClick={handleLogout}
                          className="flex items-center justify-center gap-2 py-2 border border-red-400/20 text-xs font-bold tracking-widest uppercase text-red-400/60 hover:text-red-400 rounded">
                          <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
                        </button>
                      </div>
                    ) : (
                      <a href="#pricing" onClick={smoothScroll}
                        className="block text-center py-2.5 bg-[#c1ed00] text-[#0e0e0e] text-xs font-black tracking-widest uppercase">
                        Ver planes
                      </a>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] md:min-h-[90vh] flex flex-col justify-center md:justify-end px-6 pb-16 pt-24 md:pt-20 overflow-hidden">
        <motion.div className="absolute inset-0 z-0 hero-no-parallax" style={{ y: heroY }}>
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=1600&q=80&auto=format&fit=crop"
              alt="Entrenamiento de alto rendimiento"
              fill
              className="object-cover opacity-35 scale-110"
              priority
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/50 to-transparent" />
          <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-[#0e0e0e] via-[#0e0e0e]/60 to-transparent" />
        </motion.div>

        <motion.div className="relative z-10 space-y-6 max-w-2xl" style={{ opacity: heroOpacity }}>
          <motion.h1
            className="font-headline font-bold text-[13vw] md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter uppercase"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            TRANSFORMA TUS <span className="text-[#c1ed00] italic">HÁBITOS</span>,<br className="hidden md:block" /> NO SOLO<br />TU PESO.
          </motion.h1>
          <motion.span
            className="font-label text-[#c1ed00] tracking-[0.3em] text-[10px] uppercase block"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Rompé el Ciclo
          </motion.span>
          <motion.p
            className="font-body text-on-surface-variant text-base md:text-lg max-w-md leading-relaxed border-l-4 border-[#c1ed00] pl-3 md:pl-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Un sistema diseñado para cambiar tu cuerpo y tu mentalidad de forma sostenible. <br className="md:hidden" />Sin extremos. <br className="hidden md:block" />Sin culpa. <br className="md:hidden" />Con resultados reales.
          </motion.p>
          <motion.div
            className="pt-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <a
              href="#pricing"
              onClick={smoothScroll}
              className="inline-flex items-center gap-3 bg-[#cefc22] text-[#3b4a00] font-headline font-extrabold px-8 py-4 text-base lg:text-lg tracking-tight hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(193,237,0,0.5)] active:scale-[0.98] transition-all duration-300 uppercase"
            >
              ¡EMPEZÁ AHORA!
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <span className="font-label text-[8px] uppercase tracking-[0.3em] text-white/30">Scroll</span>
          <motion.div
            className="w-px h-8 bg-gradient-to-b from-[#c1ed00] to-transparent"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top' }}
          />
        </motion.div>
      </section>

      {/* ── Three Pillars ─────────────────────────────────────────── */}
      <section id="method" className="px-6 py-10 md:py-20 bg-surface-container-low">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="mb-6 md:mb-12 space-y-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="font-headline text-3xl lg:text-5xl font-bold tracking-tighter uppercase italic">LOS TRES PILARES</h2>
            <div className="w-12 h-1 bg-[#00e3fd]" />
            <p className="hidden md:block text-on-surface-variant text-sm max-w-lg mt-3">
              No se trata de hacer dieta ni entrenar más fuerte. Se trata de construir un sistema que puedas sostener para siempre.
            </p>
          </motion.div>

          {/* Mobile: stacked; Desktop: bento */}
          <motion.div
            ref={pillarRef}
            onScroll={handlePillarScroll}
            className="flex md:grid md:grid-cols-12 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0 -mx-6 md:mx-0 pl-6 md:px-0 scrollbar-hide [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {/* Psychology — large card */}
            <motion.div
              className="flex-none w-[75vw] md:w-auto snap-start md:col-span-12 lg:col-span-8 group relative overflow-hidden bg-surface-container p-8 min-h-[360px] flex flex-col justify-start md:justify-end hover:bg-surface-container-high transition-colors duration-500"
              variants={staggerItem}
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {/* Background image */}
              <div className="absolute inset-0 opacity-20 md:opacity-0 md:group-hover:opacity-20 transition-opacity duration-700">
                <Image
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=60&auto=format&fit=crop"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
              <div className="relative z-10">
                <Brain className="w-10 h-10 text-[#ff734a] mb-4" />
                <h3 className="font-headline text-2xl font-bold uppercase mb-4 md:mb-2">Psicología</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-md">
                  <span className="md:hidden">Trabajamos tu mentalidad y tu relación con la comida. <strong className="font-black text-[#ff734a]">Hábitos reales sin autosabotaje.</strong></span>
                  <span className="hidden md:inline">Dejás de autosabotearte y empezás a sostener hábitos reales. <strong className="font-black text-[#ff734a]">Trabajamos tu mentalidad, tu relación con la comida</strong> y los patrones que hoy te frenan.</span>
                </p>
                <div className="mt-6 flex flex-row gap-2">
                  <span className="px-3 py-1 bg-[#ff5722]/20 text-[#ff9475] font-label text-[10px] uppercase tracking-widest">Constancia</span>
                  <span className="hidden md:inline px-3 py-1 bg-[#ff5722]/20 text-[#ff9475] font-label text-[10px] uppercase tracking-widest">Control de Impulsos</span>
                  <span className="px-3 py-1 bg-[#ff5722]/20 text-[#ff9475] font-label text-[10px] uppercase tracking-widest">Aceptación</span>
                </div>
              </div>
            </motion.div>

            {/* Training — smaller */}
            <motion.div
              className="flex-none w-[75vw] md:w-auto snap-start md:col-span-6 lg:col-span-4 group relative overflow-hidden bg-surface-container p-8 min-h-[360px] flex flex-col justify-start md:justify-between hover:bg-surface-container-high transition-colors duration-500"
              variants={staggerItem}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 opacity-15 md:opacity-0 md:group-hover:opacity-15 transition-opacity duration-700">
                <Image
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=60&auto=format&fit=crop"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="relative z-10">
                <Dumbbell className="w-10 h-10 text-[#c1ed00] mb-4" />
                <h3 className="font-headline text-xl font-bold uppercase mb-4 md:mb-2">Entrenamiento</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  <span className="md:hidden">Sesiones <strong className="font-black text-[#c1ed00]">adaptadas a tu nivel</strong> para mejorar tu cuerpo. Resultados reales sin perder tiempo.</span>
                  <span className="hidden md:inline">Sabés exactamente qué hacer para ver resultados sin perder tiempo. Sesiones <strong className="font-black text-[#c1ed00]">adaptadas a tu nivel</strong> para mejorar tu cuerpo de forma inteligente y progresiva.</span>
                </p>
                <div className="mt-6 flex flex-row gap-2">
                  {['Fuerza', 'Movilidad'].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-[#c1ed00]/15 text-[#c1ed00] font-label text-[10px] uppercase tracking-widest">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Nutrition — full width bottom */}
            <motion.div
              className="flex-none w-[75vw] md:w-auto snap-start md:col-span-6 lg:col-span-12 group relative overflow-hidden bg-surface-container p-8 min-h-[360px] md:min-h-[200px] flex flex-col md:flex-row items-start md:items-center gap-6 hover:bg-surface-container-high transition-colors duration-500"
              variants={staggerItem}
              whileHover={{ scale: 1.005 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 opacity-10 md:opacity-0 md:group-hover:opacity-10 transition-opacity duration-700">
                <Image
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=60&auto=format&fit=crop"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              <div className="relative z-10 flex-shrink-0">
                <Utensils className="w-10 h-10 text-[#00e3fd]" />
              </div>
              <div className="relative z-10 flex-1">
                <h3 className="font-headline text-xl font-bold uppercase mb-4 md:mb-2">Nutrición</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-lg">
                  <span className="md:hidden">Sin dietas extremas ni restricciones. Resultados reales con <strong className="font-black text-[#00e3fd]">hábitos sostenibles a largo plazo.</strong></span>
                  <span className="hidden md:inline">La diferencia no está en hacer más, sino en <strong className="font-black text-[#00e3fd]">hacerlo sostenible</strong>. Nuestro enfoque elimina los extremos y prioriza resultados reales <strong className="font-black text-[#00e3fd]">a largo plazo</strong>.</span>
                </p>
                <div className="flex flex-row gap-2 mt-6 md:hidden">
                  <span className="px-3 py-1 bg-[#00e3fd]/15 text-[#00e3fd] font-label text-[10px] uppercase tracking-widest">Perder Grasa</span>
                  <span className="px-3 py-1 bg-[#00e3fd]/15 text-[#00e3fd] font-label text-[10px] uppercase tracking-widest">Ganar Músculo</span>
                </div>
              </div>
              <div className="relative z-10 hidden md:flex gap-8 flex-shrink-0 mt-4 md:mt-0 lg:gap-12">
                <div className="text-center">
                  <span className="font-headline text-2xl lg:text-3xl font-black text-[#00e3fd] block">0%</span>
                  <span className="font-label text-[9px] uppercase tracking-widest text-white/40">Dietas Restrictivas</span>
                </div>
                <div className="text-center">
                  <span className="font-headline text-2xl lg:text-3xl font-black text-[#00e3fd] block">100%</span>
                  <span className="font-label text-[9px] uppercase tracking-widest text-white/40">Hábitos Sostenibles</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Custom scrollbar — mobile only */}
          <div className="flex md:hidden mt-4 h-[3px] bg-white/10 rounded-full relative overflow-hidden">
            <div
              className="absolute h-full w-1/3 rounded-full transition-colors duration-300"
              style={{
                left: `${pillarRatio * 66.67}%`,
                backgroundColor: pillarColors[pillarSlide],
              }}
            />
          </div>
        </div>
      </section>


      {/* ── Coach Section ─────────────────────────────────────────── */}
      <section id="coach" className="px-6 py-10 md:py-24 bg-[#0e0e0e]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 md:gap-12 items-stretch">
            <motion.div
              className="w-full md:w-1/2 flex-shrink-0 relative pb-6 flex flex-col order-2 md:order-1"
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* Etiqueta ANTES → DESPUÉS */}
              <span className="self-center mb-0.5 px-2 py-0.5 bg-[#c1ed00] text-[#1a2400] font-label font-black text-[9px] uppercase tracking-[0.2em]">
                ANTES → DESPUÉS
              </span>

              {/* Mobile: carrusel auto-play */}
              <div className="md:hidden relative overflow-hidden h-[320px] mb-0.5">
                <AnimatePresence initial={false} custom={coachDir}>
                  <motion.img
                    key={coachSlide}
                    src={COACH_PHOTOS[coachSlide].src}
                    alt={COACH_PHOTOS[coachSlide].alt}
                    custom={coachDir}
                    variants={{
                      enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full object-contain object-center bg-[#0e0e0e]"
                  />
                </AnimatePresence>
                {/* dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {COACH_PHOTOS.map((_, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === coachSlide ? 'bg-[#c1ed00]' : 'bg-white/30'}`} />
                  ))}
                </div>
              </div>

              {/* Desktop: foto principal */}
              <div className="hidden md:block overflow-hidden mb-1.5 flex-1 min-h-0">
                <motion.img
                  src="/images/ale/ale-cuerpo.jpg"
                  alt="Alejandro Gerez — transformación corporal"
                  className="w-full h-full object-cover object-center"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.6 }}
                />
              </div>

              {/* 2 stamps — solo desktop */}
              <div className="hidden md:grid grid-cols-2 gap-1.5 flex-shrink-0">
                <div className="overflow-hidden">
                  <motion.img
                    src="/images/ale/ale-cara.jpg"
                    alt="Alejandro Gerez — antes y después"
                    className="w-full h-48 object-cover object-center"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <div className="overflow-hidden">
                  <motion.img
                    src="/images/ale/ale-vida.jpg"
                    alt="Alejandro Gerez — coach"
                    className="w-full h-48 object-cover object-center"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>

              {/* Badge */}
              <motion.div
                className="md:absolute md:-bottom-1 md:-right-5 max-w-full md:max-w-[220px] bg-[#00e3fd] text-[#003a42] px-4 py-2 font-headline font-black text-xs uppercase tracking-tight leading-snug z-10 mt-0.5 md:mt-0 text-center md:text-left"
                initial={{ x: 60, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
              >
                +12 años ayudando a transformar<br />cuerpos y mentalidades
              </motion.div>
            </motion.div>
            <motion.div
              className="w-full md:w-1/2 space-y-3 md:space-y-6 order-1 md:order-2"
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <p className="font-label text-[10px] uppercase tracking-[0.25em] text-white/30">Tu Head Coach</p>
              <h2 className="font-headline text-[8vw] md:text-4xl lg:text-5xl font-bold tracking-tighter leading-none uppercase">
                <span className="text-[#c1ed00] italic">ALEJANDRO GEREZ</span>
              </h2>
              {/* Bio mobile — versión corta */}
              <div className="md:hidden font-body text-on-surface-variant text-sm leading-relaxed space-y-3 hyphens-none [word-break:normal]">
                <p>
                  Usé la comida como escape y llegué a pesar <strong className="font-black text-[#c1ed00]">160 kg</strong>. Probé todo, sin resultados duraderos.
                </p>
                <p>
                  <strong className="font-black text-[#c1ed00]">Bajé 70 kg</strong>. Participé del reality show <strong className="font-black text-[#00e3fd]">Cuestión de Peso</strong>, pero recuperé varios kilos, porque el cambio había sido físico, <strong className="font-black text-[#c1ed00] whitespace-nowrap uppercase">NO MENTAL</strong>.
                </p>
                <p className="text-white">
                  Hoy no vivo en lucha. <span className="text-[#c1ed00]">Vivo en equilibrio.</span><br />Ese es el método que hoy<br /><strong className="font-black text-[#ff734a]">enseño y practico.</strong>
                </p>
              </div>

              {/* Bio desktop — versión completa */}
              <div className="hidden md:block font-body text-on-surface-variant leading-relaxed space-y-4">
                <p>
                  Durante años usé la comida como escape y llegué a pesar <strong className="font-black text-[#c1ed00]">160 kg</strong>.
                  Probé dietas, buscando la fórmula perfecta que me hiciera cambiar de una vez.
                </p>
                <p>
                  <strong className="font-black text-[#c1ed00]">Bajé 70 kg</strong> en total, participando en el programa televisivo <em className="font-black text-[#00e3fd]">Cuestión de Peso</em>, pero con el tiempo volví al mismo lugar.<br />
                  Porque el cambio había sido físico, <strong className="font-black text-[#c1ed00] uppercase">NO MENTAL.</strong>
                </p>
                <p>
                  Ahí entendí algo clave: la verdadera transformación no es una foto del antes y después,
                  es lo que pasa <strong className="font-black text-[#ff734a]">cuando nadie está mirando.</strong>
                </p>
                <p>
                  Empecé a trabajar en mi mentalidad, mi relación con la comida y conmigo mismo.
                </p>
                <p className="text-white">
                  Hoy no vivo en lucha. <span className="text-[#c1ed00]">Vivo en equilibrio.</span>
                </p>
                <p>
                  Y ese es el método que <span className="text-[#ff734a]">hoy enseño y practico.</span>
                </p>
              </div>
              <motion.ul
                className="space-y-2 md:space-y-3 font-body text-sm text-white/70 hyphens-none [word-break:normal]"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  'Psicología aplicada al cambio de hábitos',
                  'Nutrición enfocada en resultados sostenibles',
                  'Entrenamientos pensados para resultados reales que puedas mantener',
                ].map((item) => (
                  <motion.li key={item} className="flex items-start gap-3" variants={staggerItem}>
                    <span className="w-1.5 h-1.5 bg-[#c1ed00] flex-shrink-0 mt-2" />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>

              {/* Certificaciones */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#c1ed00] font-label font-bold mt-6 mb-3">Certificaciones</p>
                <div className="flex flex-col gap-3">
                  <div className="border border-white/10 bg-white/5 px-4 py-3 rounded-sm flex items-start gap-3">
                    <Award className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#c1ed00]" />
                    <div>
                      <p className="uppercase text-[11px] font-bold text-white font-label tracking-wide">Personal Fitness Trainer</p>
                      <p className="text-[10px] text-white/50 font-body mt-0.5">IFBB Federation</p>
                      <p className="text-[10px] text-[#c1ed00] font-body mt-0.5">IFBB-C/64123</p>
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/5 px-4 py-3 rounded-sm flex items-start gap-3">
                    <Award className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#c1ed00]" />
                    <div>
                      <p className="uppercase text-[11px] font-bold text-white font-label tracking-wide">Obesidad y Recomposición Corporal</p>
                      <p className="text-[10px] text-white/50 font-body mt-0.5">IFBB Federation</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Marquee Mantra ────────────────────────────────────────── */}
      <section aria-hidden="true" className="bg-[#000000] py-10 lg:py-14 border-y border-white/5 overflow-hidden select-none">
        <div className="r3set-marquee-left whitespace-nowrap mb-4 lg:mb-6">
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase r3set-text-stroke italic">AMOR PROPIO ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase text-[#c1ed00] italic">CONSTANCIA ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase r3set-text-stroke italic">DISCIPLINA ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase text-[#c1ed00] italic">PROPÓSITO ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase r3set-text-stroke italic">AMOR PROPIO ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase text-[#c1ed00] italic">CONSTANCIA ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase r3set-text-stroke italic">DISCIPLINA ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase text-[#c1ed00] italic">PROPÓSITO ·</span>
        </div>
        <div className="r3set-marquee-right whitespace-nowrap">
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase r3set-text-stroke italic">RESILIENCIA ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase text-white/10 italic">CONFIANZA ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase r3set-text-stroke italic">SEGURIDAD ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase text-white/10 italic">FORTALEZA ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase r3set-text-stroke italic">RESILIENCIA ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase text-white/10 italic">CONFIANZA ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase r3set-text-stroke italic">SEGURIDAD ·</span>
          <span className="font-headline text-5xl md:text-7xl lg:text-8xl font-black px-6 uppercase text-white/10 italic">FORTALEZA ·</span>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────── */}
      <section id="pricing" className="py-14 md:py-24 px-6 bg-[#0e0e0e] relative overflow-x-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c1ed00]/[0.03] blur-[160px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none overflow-hidden" />
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Header */}
          <div className="-mb-3 md:mb-16">
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-white/30 mb-3">Elegí tu plan</p>
            <h2 className="font-headline text-4xl lg:text-6xl font-black tracking-tighter uppercase mb-4">
              EMPEZÁ TU<br /><span className="text-[#c1ed00] italic">TRANSFORMACIÓN.</span>
            </h2>
            <p className="hidden md:block text-on-surface-variant max-w-lg text-base leading-relaxed font-body">
              Entrenamiento personalizado, seguimiento real y un coach<br />que te acompaña. Elegí el plan que mejor se adapte a tus objetivos.
            </p>
          </div>

          {/* Cards */}
          <div
            ref={pricingRef}
            onScroll={handlePricingScroll}
            className="flex md:grid md:grid-cols-2 gap-5 lg:gap-8 mb-4 md:mb-16 items-stretch overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-6 md:mx-0 pl-6 md:px-0 pb-2 md:pb-0 max-w-4xl md:mx-auto [&::-webkit-scrollbar]:hidden pt-6 md:pt-8"
            style={{ scrollbarWidth: 'none' } as React.CSSProperties}
          >
            {[
              {
                id: 'monthly', name: 'PLAN BASE', price: 44999, days: 30, badge: null, color: '#c1ed00',
                desc: 'La forma más simple de empezar tu transformación.',
                features: [
                  'Rutina personalizada (gimnasio - hogar)',
                  'App exclusiva Android e iPhone',
                  'Videos explicativos de cada ejercicio',
                  'Seguimiento semanal',
                  'Soporte en plataforma',
                  'Comunidad privada de alumnos',
                  'Sin permanencia — cancelá cuando quieras',
                  { section: 'Complementá tu proceso con:' },
                  'Consultas nutricionales con profesionales especializados',
                  'Acompañamiento psicológico para fortalecer hábitos y emociones',
                ],
                priceNote: 'Ahorrá en los planes de 3 y 6 meses',
              },
              {
                id: 'mentoria', name: 'MENTORÍA 1 A 1', price: 0, days: 0, badge: 'CUPOS LIMITADOS', color: '#ff734a',
                desc: 'Trabajá directamente conmigo y construyamos juntos un cambio que puedas sostener para toda la vida.',
                features: [
                  { text: 'Comunicación directa conmigo', bold: true },
                  { text: 'Entrenamiento personalizado 100%', sub: '(gimnasio - hogar)' },
                  'Estrategia alimentaria adaptada',
                  { text: 'Seguimiento y análisis de todas tus comidas', bold: true },
                  'Ajustes permanentes',
                  'Aplicación exclusiva para Android e iPhone',
                  { text: 'Sesiones 1-1 conmigo', bold: true },
                  'Comunidad privada de alumnos',
                  'Prioridad absoluta en la respuesta',
                  { section: 'Complementá tu proceso con:' },
                  'Consultas nutricionales con profesionales especializados',
                  'Acompañamiento psicológico para fortalecer hábitos y emociones',
                ],
              },
            ].map((plan) => (
              <div
                key={plan.id}
                ref={plan.id === 'mentoria' ? mentoriaCardRef : undefined}
                className={`w-[70vw] flex-shrink-0 snap-start md:w-auto md:flex-shrink-0 overflow-visible flex flex-col${plan.id === 'mentoria' && mentoriaActive ? ' mentoria-active' : ''}`}
              >
                <PricingCard plan={plan} locale={locale} activeSub={activeSub} />
              </div>
            ))}
          </div>

          {/* Dots mobile */}
          <div className="flex md:hidden justify-center gap-2 mb-10">
            {[0, 1].map(i => (
              <span key={i} className={`h-2 rounded-full transition-all duration-300 ${
                i === pricingSlide
                  ? (i === 0 ? 'w-4 bg-[#c1ed00]' : 'w-4 bg-[#ff734a]')
                  : 'w-2 bg-white/20'
              }`} />
            ))}
          </div>

          {/* Trust */}
          <div className="flex flex-nowrap justify-center gap-4 md:gap-8 text-white/30 text-[10px] md:text-xs font-label uppercase tracking-widest">
            <span className="flex items-center gap-1.5 md:gap-2">
              <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 text-[#c1ed00]" />
              <span className="hidden md:inline">Acceso inmediato al pagar</span>
              <span className="md:hidden">Acceso inmediato</span>
            </span>
            <span className="flex items-center gap-1.5 md:gap-2">
              <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 text-[#00e3fd]" />
              <span className="hidden md:inline">Pago seguro con Mercado Pago</span>
              <span className="md:hidden">Pago seguro</span>
            </span>
            <span className="flex items-center gap-1.5 md:gap-2">
              <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 text-[#ff734a]" />
              <span className="hidden md:inline">Soporte por WhatsApp incluido</span>
              <span className="md:hidden">Soporte WhatsApp</span>
            </span>
          </div>
        </div>
      </section>

      {/* ── Transformaciones ──────────────────────────────────────── */}
      <section id="transformations" className="py-10 md:py-24 px-3 md:px-6 bg-[#000000] relative overflow-hidden scroll-mt-24">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-12 gap-6"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp} custom={0}
          >
            <div className="max-w-2xl space-y-3">
              <p className="font-label text-[#c1ed00] tracking-[0.4em] uppercase text-[10px]">
                Testimonios R3SET
              </p>
              <h2 className="font-headline text-3xl sm:text-4xl lg:text-6xl font-black tracking-tighter uppercase leading-[0.95]">
                TRANSFORMACIONES <span className="text-[#c1ed00] italic">REALES</span>
              </h2>
              <div className="w-12 h-1 bg-[#c1ed00]" />
            </div>
            <p className="hidden md:block font-body text-on-surface-variant text-sm leading-relaxed italic md:text-right max-w-xs">
              Esto no es teoría. Son personas que ya hicieron el proceso y hoy viven distinto.
            </p>
          </motion.div>

          <Carousel opts={{ align: 'start', loop: true }} className="w-full select-none">
            <TransformationCarouselContent locale={locale} />
          </Carousel>

          {/* CTA */}
          <motion.div
            className="mt-6 md:mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-headline text-2xl lg:text-3xl font-bold uppercase tracking-tight mb-6">
              ¡Vos podés ser el<br /><span className="text-[#c1ed00] italic">próximo caso!</span>
            </p>
            <a
              href="#pricing"
              onClick={smoothScroll}
              className="inline-flex items-center gap-3 bg-[#cefc22] text-[#3b4a00] font-headline font-extrabold px-8 py-4 text-base lg:text-lg tracking-tight hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(193,237,0,0.5)] active:scale-[0.98] transition-all duration-300 uppercase"
            >
              ¡EMPEZÁ AHORA!
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-6 md:py-24 px-6 bg-surface-container-low">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            className="mb-4 md:mb-14 space-y-1 md:space-y-2"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp} custom={0}
          >
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-white/30">Preguntas frecuentes</p>
            <h2 className="font-headline text-xl md:text-3xl lg:text-4xl font-bold tracking-tighter uppercase italic">FAQ</h2>
            <div className="w-8 md:w-12 h-1 bg-[#00e3fd]" />
          </motion.div>

          <div className="space-y-0 divide-y divide-white/8">
            {[
              {
                q: '¿Necesito experiencia previa para empezar?',
                a: 'No. Nuestros programas están diseñados tanto para personas que recién comienzan como para quienes ya tienen experiencia entrenando. Adaptamos el entrenamiento a tu nivel actual y progresamos paso a paso.',
              },
              {
                q: '¿Cómo funciona el seguimiento?',
                a: 'A través de nuestra aplicación registrás tus entrenamientos, progreso y hábitos. Además, realizamos seguimientos periódicos para ajustar el plan según tu evolución.',
              },
              {
                q: '¿Qué incluye el acompañamiento nutricional y psicológico?',
                a: 'Contarás con la posibilidad de ser atendido por profesionales especializados que te ayudarán a mejorar tu alimentación, fortalecer hábitos y trabajar los aspectos emocionales que muchas veces dificultan sostener el cambio.',
              },
              {
                q: '¿Cuál es la diferencia entre el Plan Base y la Mentoría 1 a 1?',
                a: 'El Plan Base incluye entrenamiento personalizado, aplicación, seguimiento y acompañamiento profesional. La Mentoría 1 a 1 incluye todo lo anterior, más comunicación directa con Ale Gerez, seguimiento personalizado de alimentación y hábitos, sesiones individuales y ajustes permanentes según tu evolución.',
              },
              {
                q: '¿Cuándo obtengo acceso después de inscribirme?',
                a: 'Los alumnos del Plan Base reciben acceso a la plataforma una vez confirmado el pago. En el caso de la Mentoría 1 a 1, primero deberás completar una solicitud de evaluación. Revisará personalmente tu caso y, si considera que puede ayudarte, se pondrá en contacto dentro de las próximas 24 horas hábiles para coordinar una videollamada.',
              },
              {
                q: '¿Puedo cancelar mi suscripción en cualquier momento?',
                a: 'Sí. Podés cancelar tu suscripción cuando lo desees y seguirás teniendo acceso hasta finalizar el período ya abonado. No existen permanencias ni penalizaciones.',
              },
              {
                q: '¿Por qué este programa es diferente?',
                a: 'Porque fue creado desde la experiencia real. Ale Gerez llegó a pesar más de 160 kg y atravesó personalmente el proceso de transformación que hoy ayuda a recorrer a otras personas. El programa combina entrenamiento, nutrición y trabajo de hábitos para lograr cambios sostenibles en el tiempo.',
              },
              {
                q: '¿Cómo sé qué plan es el adecuado para mí?',
                a: 'Si estás comenzando o buscás una guía estructurada, el Plan Base suele ser la mejor opción. Si necesitás un acompañamiento más cercano y personalizado, podés solicitar una evaluación para la Mentoría 1 a 1.',
              },
            ].map(({ q, a }, i) => (
              <FAQItem key={i} question={q} answer={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacto ──────────────────────────────────────────────── */}
      <section id="contact" className="py-10 md:py-24 px-6 bg-[#0e0e0e]">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-6 md:mb-14 space-y-2"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp} custom={0}
          >
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-white/30">¿Tenés dudas?</p>
            <h2 className="font-headline text-3xl lg:text-4xl font-bold tracking-tighter uppercase italic">HABLEMOS.</h2>
            <div className="w-12 h-1 bg-[#00e3fd] mx-auto" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.a
              href={`https://wa.me/${PHONE_NUMBER}?text=Hola!%20Tengo%20una%20consulta%20sobre%20el%20Metodo%20R3SET`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-5 px-6 bg-[#c1ed00] text-[#0e0e0e] font-headline font-black text-sm uppercase tracking-widest hover:bg-[#d4ff00] active:scale-95 transition-all duration-200"
              variants={staggerItem}
              whileHover={{ scale: 1.02 }}
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </motion.a>
            <motion.a
              href="mailto:alegerezcoach@gmail.com?subject=Consulta%20Metodo%20R3SET"
              className="flex items-center justify-center gap-3 py-5 px-6 border border-white/15 text-white/70 font-headline font-black text-sm uppercase tracking-widest hover:border-white/30 hover:text-white active:scale-95 transition-all duration-200"
              variants={staggerItem}
              whileHover={{ scale: 1.02 }}
            >
              <Mail className="w-5 h-5" />
              Email
            </motion.a>
          </motion.div>

          <motion.p
            className="text-center font-label text-[8px] md:text-[10px] text-white/25 uppercase tracking-widest mt-8 whitespace-nowrap"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Respondemos dentro de las 24 hs · Sin compromiso
          </motion.p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section id="cta" className="py-10 md:py-24 px-6 text-center bg-surface-container-low border-y border-[#484847]/10 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#c1ed00]/5 rounded-full blur-[120px]" />
        </div>
        <motion.div
          className="max-w-2xl mx-auto relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="font-headline text-3xl lg:text-5xl font-bold tracking-tighter uppercase mb-4 leading-tight"
            variants={fadeUp}
            custom={0}
          >
            ¿LISTO PARA <span className="text-[#c1ed00]" style={{ textShadow: '0 0 30px rgba(193,237,0,0.4)' }}>TRANSFORMAR</span><br className="hidden sm:block" /> TU CUERPO Y MENTE?
          </motion.h2>
          <motion.p
            className="font-headline text-sm md:text-lg lg:text-2xl font-bold uppercase tracking-tight text-white/80 mb-6 whitespace-nowrap"
            variants={fadeUp}
            custom={1}
          >
            Es momento de <span className="text-[#00e3fd] italic">recodificar</span> tus hábitos.
          </motion.p>
          <motion.p
            className="hidden md:block text-on-surface-variant mb-10 max-w-md mx-auto font-body leading-relaxed"
            variants={fadeUp}
            custom={2}
          >
            Sumate a la mentoría 1-1 del método R3SET y empezá a construir resultados que sí puedas sostener.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="flex flex-col items-center gap-4">
            <Link
              href={`/${locale}/evaluacion`}
              className="inline-flex items-center gap-3 bg-[#ff734a] text-[#0e0e0e] font-headline font-extrabold px-10 py-5 text-base lg:text-lg tracking-tight hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(255,115,74,0.5)] active:scale-[0.98] transition-all duration-300 uppercase"
            >
              SOLICITAR EVALUACIÓN
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="font-label text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-white/40">
              Cupos limitados <span className="text-[#c1ed00]/60 mx-1">•</span> Acceso online<span className="md:hidden"> </span><span className="hidden md:inline"> <span className="text-[#c1ed00]/60 mx-1">•</span> Empezá ya</span>
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <motion.footer
        className="w-full py-6 md:py-12 px-6 border-t border-[#484847]/15 bg-[#000000] flex flex-col md:flex-row justify-between items-center gap-3 md:gap-6 pb-20 md:pb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center md:items-start gap-2">
          <Image src="/images/icon-r3set.png" alt="MÉTODO R3SET" width={36} height={36} className="rounded-xl" />
          <p className="font-label text-[8px] md:text-xs uppercase text-white/30 tracking-widest whitespace-nowrap">© {new Date().getFullYear()} MÉTODO R3SET. TODOS LOS DERECHOS RESERVADOS.</p>
        </div>
        <div className="flex gap-4 md:gap-8">
          <a href="#" className="font-label text-[9px] md:text-xs uppercase text-white/30 hover:text-white transition-colors duration-300">Privacidad</a>
          <a href="#" className="font-label text-[9px] md:text-xs uppercase text-white/30 hover:text-white transition-colors duration-300">Términos</a>
          <a href="#" className="font-label text-[9px] md:text-xs uppercase text-white/30 hover:text-white transition-colors duration-300">Contacto</a>
        </div>
        <div className="hidden md:flex gap-4">
          <Share2 className="w-5 h-5 text-white/30 hover:text-[#00e3fd] transition-colors duration-300 cursor-pointer" />
          <Megaphone className="w-5 h-5 text-white/30 hover:text-[#00e3fd] transition-colors duration-300 cursor-pointer" />
        </div>
      </motion.footer>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────── */}
      <nav className="hidden fixed bottom-0 left-0 w-full grid grid-cols-5 items-center h-16 bg-[#0e0e0e]/95 backdrop-blur-xl z-40 border-t border-white/5">
        <a href="#method" onClick={smoothScroll} className="flex flex-col items-center justify-center gap-1 text-[#D1FF26] active:scale-90 transition-all">
          <Brain className="w-5 h-5" />
          <span className="font-label text-[9px] uppercase tracking-widest">Método</span>
        </a>
        <a href="#coach" onClick={smoothScroll} className="flex flex-col items-center justify-center gap-1 text-white/50 active:scale-90 transition-all">
          <Dumbbell className="w-5 h-5" />
          <span className="font-label text-[9px] uppercase tracking-widest">Coach</span>
        </a>
        <a href="#transformations" onClick={smoothScroll} className="flex flex-col items-center justify-center gap-1 text-white/50 active:scale-90 transition-all">
          <Sparkles className="w-5 h-5" />
          <span className="font-label text-[9px] uppercase tracking-widest">Transform.</span>
        </a>
        <a href="#pricing" onClick={smoothScroll} className="flex flex-col items-center justify-center gap-1 text-white/50 active:scale-90 transition-all">
          <Zap className="w-5 h-5" />
          <span className="font-label text-[9px] uppercase tracking-widest">Planes</span>
        </a>
        {user ? (
          <Link href={`/${locale}/dashboard`} className="flex flex-col items-center justify-center gap-1 text-[#c1ed00]/70 active:scale-90 transition-all">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-label text-[9px] uppercase tracking-widest">Mi Área</span>
          </Link>
        ) : (
          <Link href={`/${locale}/register`} className="flex flex-col items-center justify-center gap-1 text-white/50 active:scale-90 transition-all">
            <UserPlus className="w-5 h-5" />
            <span className="font-label text-[9px] uppercase tracking-widest">Unirse</span>
          </Link>
        )}
      </nav>
      {/* ── Scroll to top ─────────────────────────────────────────── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#c1ed00] flex items-center justify-center shadow-lg shadow-black/30 transition-opacity duration-300 ${showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronUp className="w-5 h-5 text-[#0e0e0e]" />
      </button>
    </V4SplashManager>
  )
}
