'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import V4SplashManager from '@/components/v4/V4SplashScreen'
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Brain, Dumbbell, Sparkles, Zap, UserPlus, ArrowRight, Check, Plus, Utensils, Shield, MessageCircle, Mail, Share2, Megaphone } from 'lucide-react'
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
      const el = document.getElementById('contact')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/${locale}/checkout?plan=${plan.id}`)
    }
  }

  return (
    <div className={`relative flex flex-col rounded-none p-6 lg:p-8 border transition-all duration-300 hover:-translate-y-1 ${
      isMentoria
        ? 'border-[#ff734a]/40 bg-[#ff734a]/[0.04] hover:border-[#ff734a]/60'
        : 'border-[#c1ed00]/30 bg-[#c1ed00]/[0.03] hover:border-[#c1ed00]/50'
    }`}>
      {/* Badge */}
      {isCurrent ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-black tracking-widest font-label uppercase bg-white text-[#0e0e0e]">
          TU PLAN ACTUAL
        </div>
      ) : plan.badge ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-black tracking-widest font-label uppercase"
          style={{ backgroundColor: plan.color, color: '#0e0e0e' }}>
          {plan.badge}
        </div>
      ) : null}

      {/* Label */}
      <p className="font-label text-xs font-bold tracking-widest uppercase mb-2" style={{ color: plan.color }}>
        {isMentoria ? 'ACOMPAÑAMIENTO PERSONALIZADO' : 'ACCESO INMEDIATO'}
      </p>
      <h3 className="font-headline text-2xl font-black mb-3">{plan.name}</h3>

      {/* Price */}
      {isMentoria ? (
        <div className="mb-1">
          <span className="font-headline text-2xl font-black text-white/50 uppercase tracking-tight">Precio a consultar</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-sm text-white/40 font-label">Desde ARS</span>
          <span className="font-headline text-4xl font-black">${plan.price.toLocaleString('es-AR')}</span>
          <span className="text-sm text-white/40 font-label">/mes</span>
        </div>
      )}
      {plan.priceNote && (
        <p className="text-[11px] text-white/30 font-label uppercase tracking-widest mb-3">
          {plan.priceNote}
        </p>
      )}
      {isMentoria && (
        <p className="text-[11px] text-white/30 font-label uppercase tracking-widest mb-3">
          Cancelable cuando quieras · Sin permanencia
        </p>
      )}

      <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-body">{plan.desc}</p>

      {isMentoria && (
        <p className="text-[11px] text-white/40 font-label italic mb-4 border-l-2 border-[#ff734a]/30 pl-3">
          Incluye todo lo del Plan Base más el acompañamiento directo y personalizado de Ale Gerez.
        </p>
      )}

      <ul className="space-y-2.5 mb-8 flex-1">
        {plan.features.map((f: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant font-body">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
            {f}
          </li>
        ))}
      </ul>

      {error && <p className="text-red-400 text-xs mb-3 text-center bg-red-400/10 rounded py-2 px-3 font-label">{error}</p>}

      <button onClick={handleBuy} disabled={loading}
        className="w-full py-3.5 font-headline font-black text-sm tracking-widest uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:opacity-90 active:scale-95"
        style={{ backgroundColor: loading ? '#333' : plan.color, color: '#0e0e0e' }}>
        {loading ? 'PROCESANDO...' : isMentoria ? 'SOLICITAR EVALUACIÓN' : isCurrent ? 'RENOVAR PLAN' : 'EMPEZAR AHORA'}
      </button>
    </div>
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
    <div className="py-5">
      <button
        className="w-full flex items-start justify-between gap-4 text-left group"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-headline font-bold text-base lg:text-lg uppercase tracking-tight group-hover:text-[#c1ed00] transition-colors duration-200">
          {question}
        </span>
        <Plus className={`w-5 h-5 flex-shrink-0 text-white/30 transition-transform duration-300 mt-0.5 ${open ? 'rotate-45' : ''}`} />
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
            <p className="font-body text-on-surface-variant text-sm leading-relaxed pt-4 max-w-2xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

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

  // Active subscription
  const [activeSub, setActiveSub] = useState<ActiveSub | null>(null)

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
          <span className="text-xl sm:text-2xl font-black text-[#D1FF26] font-headline tracking-[-0.04em] uppercase">METODO R3SET</span>

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
                  className="bg-[#cefc22] text-[#3b4a00] px-5 py-2 font-headline font-bold text-xs tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all">
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
              className="md:hidden absolute top-full left-0 right-0 bg-[#0e0e0e]/98 backdrop-blur-xl border-t border-white/8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-6 py-6 flex flex-col gap-5">
                {/* Nav links */}
                {[
                  { href: '#method', label: 'Método' },
                  { href: '#coach', label: 'Coach' },
                  { href: '#transformations', label: 'Transformaciones' },
                  { href: '#pricing', label: 'Programas' },
                ].map(({ href, label }) => (
                  <a key={href} href={href} onClick={smoothScroll}
                    className="text-sm font-bold tracking-[0.2em] uppercase text-white/60 hover:text-[#c1ed00] transition-colors">
                    {label}
                  </a>
                ))}

                <div className="border-t border-white/8 pt-4">
                  {!authLoading && (
                    user ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-[#c1ed00] flex items-center justify-center text-[#0e0e0e] font-black text-sm">
                            {initial}
                          </div>
                          <div>
                            <p className="text-white text-sm font-bold truncate max-w-[180px]">{displayName}</p>
                            {activeSub && (
                              <p className="text-[10px] text-[#c1ed00]/70 uppercase tracking-widest">{PLAN_NAMES[activeSub.plan_id] ?? activeSub.plan_id} activo</p>
                            )}
                          </div>
                        </div>
                        <Link href={`/${locale}/dashboard`} onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-2 py-3 border border-white/15 text-sm font-bold tracking-widest uppercase text-white/70 hover:text-white rounded">
                          <LayoutDashboard className="w-4 h-4" /> Mi Dashboard
                        </Link>
                        <button onClick={handleLogout}
                          className="flex items-center justify-center gap-2 py-3 border border-red-400/20 text-sm font-bold tracking-widest uppercase text-red-400/60 hover:text-red-400 rounded">
                          <LogOut className="w-4 h-4" /> Cerrar sesión
                        </button>
                      </div>
                    ) : (
                      <a href="#pricing" onClick={smoothScroll}
                        className="block text-center py-3.5 bg-[#c1ed00] text-[#0e0e0e] text-sm font-black tracking-widest uppercase rounded">
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
      <section className="relative min-h-screen flex flex-col justify-end px-6 pb-16 pt-24 md:pt-20 overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={{ y: heroY }}>
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=1600&q=80&auto=format&fit=crop"
              alt="Entrenamiento de alto rendimiento"
              fill
              className="object-cover opacity-50 scale-110"
              priority
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/50 to-transparent" />
          <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-[#0e0e0e] via-[#0e0e0e]/60 to-transparent" />
        </motion.div>

        <motion.div className="relative z-10 space-y-6 max-w-2xl" style={{ opacity: heroOpacity }}>
          <motion.span
            className="font-label text-[#c1ed00] tracking-[0.3em] text-[10px] uppercase block"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Rompe el Ciclo
          </motion.span>
          <motion.h1
            className="font-headline font-bold text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter uppercase"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            TRANSFORMA TUS <span className="text-[#c1ed00] italic">HÁBITOS</span>,<br className="hidden md:block" /> NO SOLO TU PESO.
          </motion.h1>
          <motion.p
            className="font-body text-on-surface-variant text-lg max-w-md leading-relaxed border-l-4 border-[#c1ed00] pl-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Un sistema diseñado para cambiar tu cuerpo y tu mentalidad de forma sostenible.<br />
            Sin extremos. Sin culpa. Con resultados reales.
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
              className="inline-flex items-center gap-3 bg-[#cefc22] text-[#3b4a00] font-headline font-extrabold px-8 py-4 text-base lg:text-lg tracking-tight hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(206,252,34,0.3)] active:scale-[0.98] transition-all duration-300 uppercase"
            >
              ¡VER PLANES!
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
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
      <section id="method" className="px-6 py-20 bg-surface-container-low">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="mb-12 space-y-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="font-headline text-3xl lg:text-5xl font-bold tracking-tighter uppercase italic">LOS TRES PILARES</h2>
            <div className="w-12 h-1 bg-[#00e3fd]" />
            <p className="text-on-surface-variant text-sm max-w-lg mt-3">
              No se trata de hacer dieta ni entrenar más fuerte. Se trata de construir un sistema que puedas sostener para siempre.
            </p>
          </motion.div>

          {/* Mobile: stacked; Desktop: bento */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-12 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {/* Psychology — large card */}
            <motion.div
              className="md:col-span-12 lg:col-span-8 group relative overflow-hidden bg-surface-container p-8 min-h-[300px] flex flex-col justify-end hover:bg-surface-container-high transition-colors duration-500"
              variants={staggerItem}
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute top-6 right-6 text-[#c1ed00]/10 font-headline font-black text-8xl italic pointer-events-none select-none">01</div>
              {/* Background image */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700">
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
                <h3 className="font-headline text-2xl font-bold uppercase mb-2">Psicología</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
                  Dejás de autosabotearte y empezás a sostener hábitos reales. Trabajamos tu mentalidad, tu relación con la comida y los patrones que hoy te frenan.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Constancia Real', 'Control de Impulsos', 'Aceptación'].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-[#ff5722]/20 text-[#ff9475] font-label text-[10px] uppercase tracking-widest">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Training — smaller */}
            <motion.div
              className="md:col-span-6 lg:col-span-4 group relative overflow-hidden bg-surface-container p-8 min-h-[250px] flex flex-col justify-between hover:bg-surface-container-high transition-colors duration-500"
              variants={staggerItem}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-700">
                <Image
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=60&auto=format&fit=crop"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="relative z-10">
                <Dumbbell className="w-10 h-10 text-[#c1ed00]" />
              </div>
              <div className="relative z-10">
                <h3 className="font-headline text-xl font-bold uppercase mb-2">Entrenamiento</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Sabés exactamente qué hacer para ver resultados sin perder tiempo. Sesiones adaptadas a tu nivel para mejorar tu cuerpo de forma inteligente y progresiva.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Bajar Grasa', 'Ganar Músculo'].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-[#c1ed00]/15 text-[#c1ed00] font-label text-[10px] uppercase tracking-widest">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Nutrition — full width bottom */}
            <motion.div
              className="md:col-span-6 lg:col-span-12 group relative overflow-hidden bg-surface-container p-8 min-h-[200px] flex flex-col md:flex-row items-start md:items-center gap-6 hover:bg-surface-container-high transition-colors duration-500"
              variants={staggerItem}
              whileHover={{ scale: 1.005 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
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
                <h3 className="font-headline text-xl font-bold uppercase mb-2">Nutrición</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-lg">
                  La diferencia no está en hacer más, sino en hacerlo sostenible. Nuestro enfoque elimina los extremos y prioriza resultados reales a largo plazo.
                </p>
              </div>
              <div className="relative z-10 hidden lg:flex gap-12 flex-shrink-0">
                <div className="text-center">
                  <span className="font-headline text-3xl font-black text-[#00e3fd] block">0%</span>
                  <span className="font-label text-[10px] uppercase tracking-widest text-white/40">Dietas Restrictivas</span>
                </div>
                <div className="text-center">
                  <span className="font-headline text-3xl font-black text-[#00e3fd] block">100%</span>
                  <span className="font-label text-[10px] uppercase tracking-widest text-white/40">Sustentabilidad</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Methodology / Phases ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#000000] relative overflow-hidden">
        <div className="absolute left-0 top-0 w-24 h-full border-r border-white/5 hidden xl:block" />
        <div className="container mx-auto max-w-6xl xl:pl-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="relative order-2 lg:order-1"
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="aspect-[4/5] bg-surface-container overflow-hidden border border-white/5">
                <motion.img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&auto=format&fit=crop"
                  alt="Entrenamiento"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <motion.div
                className="absolute -bottom-6 -right-6 bg-[#cefc22] p-8 hidden lg:block"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5, type: 'spring' }}
              >
                <span className="font-headline text-5xl font-black text-[#3b4a00] leading-none">R3</span>
                <span className="font-label text-[#3b4a00] block text-xs font-bold tracking-[0.4em] mt-1">MÉTODO</span>
              </motion.div>
            </motion.div>
            <motion.div
              className="order-1 lg:order-2"
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <h2 className="font-headline text-4xl lg:text-5xl font-black tracking-tighter uppercase mb-10 leading-tight italic">
                RECODIFICÁ.<br />RECONSTRUÍ.<br /><span className="text-[#c1ed00]">R3SET.</span>
              </h2>
              <div className="space-y-8">
                {[
                  { n: '01', t: 'Recodificación', d: 'Identificamos los patrones que hoy te frenan y construimos una mentalidad que te permita sostener el cambio.' },
                  { n: '02', t: 'Reconstrucción', d: 'Aplicamos entrenamiento y nutrición de forma progresiva para transformar tu cuerpo sin extremos.' },
                  { n: '03', t: 'R3SET', d: 'Consolidás hábitos y resultados hasta que se convierten en tu nueva forma de vivir.' },
                ].map(({ n, t, d }, i) => (
                  <motion.div
                    key={n}
                    className="group flex gap-5"
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <span className="text-3xl font-headline font-black text-white/15 group-hover:text-[#c1ed00] transition-colors duration-500 flex-shrink-0">{n}</span>
                    <div>
                      <h4 className="text-lg font-headline font-bold uppercase tracking-tight mb-2">{t}</h4>
                      <p className="text-on-surface-variant font-body text-sm leading-relaxed">{d}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Coach Section ─────────────────────────────────────────── */}
      <section id="coach" className="px-6 py-24 bg-[#0e0e0e]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <motion.div
              className="w-full md:w-1/2 flex-shrink-0 relative"
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2 overflow-hidden">
                  <motion.img
                    src="/images/ale/ale-cuerpo.jpg"
                    alt="Alejandro Gerez - Transformación"
                    className="w-full h-48 object-cover object-top"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <div className="overflow-hidden">
                  <motion.img
                    src="/images/ale/ale-cara.jpg"
                    alt="Alejandro Gerez - Antes y Después"
                    className="w-full h-44 object-cover object-center"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <div className="overflow-hidden">
                  <motion.img
                    src="/images/ale/ale-vida.jpg"
                    alt="Alejandro Gerez - Coach"
                    className="w-full h-44 object-cover object-top"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
              {/* Badge */}
              <motion.div
                className="absolute -bottom-5 -right-5 max-w-[260px] bg-[#00e3fd] text-[#003a42] px-5 py-3 font-headline font-black text-xs sm:text-sm uppercase tracking-tight leading-tight z-10"
                initial={{ x: 60, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
              >
                +12 años ayudando a personas a transformar su cuerpo y su mentalidad
              </motion.div>
            </motion.div>
            <motion.div
              className="w-full md:w-1/2 space-y-6"
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <p className="font-label text-[10px] uppercase tracking-[0.25em] text-white/30">Tu Head Coach</p>
              <h2 className="font-headline text-4xl lg:text-5xl font-bold tracking-tighter leading-none uppercase">
                <span className="text-[#c1ed00] italic">ALEJANDRO GEREZ</span>
              </h2>
              <div className="font-body text-on-surface-variant leading-relaxed space-y-4">
                <p>
                  Durante años usé la comida como escape y llegué a pesar 160 kg.
                  Probé dietas, buscando la fórmula perfecta que me hiciera cambiar de una vez.
                </p>
                <p>
                  Bajé 70 kg en total, participando en <em>Cuestión de Peso</em>, pero con el tiempo volví al mismo lugar.
                  Porque el cambio había sido físico, no mental.
                </p>
                <p>
                  Ahí entendí algo clave: la verdadera transformación no es una foto del antes y después,
                  es lo que pasa cuando nadie está mirando.
                </p>
                <p>
                  Empecé a trabajar en mi mentalidad, mi relación con la comida y conmigo mismo.
                </p>
                <p className="text-white">
                  Hoy no vivo en lucha. <span className="text-[#c1ed00]">Vivo en equilibrio.</span>
                </p>
                <p>
                  Y ese es el método que hoy enseño y practico.
                </p>
              </div>
              <motion.ul
                className="space-y-3 font-body text-sm text-white/70"
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
      <section id="pricing" className="py-24 px-6 bg-[#0e0e0e] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c1ed00]/[0.03] blur-[160px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Header */}
          <div className="mb-16">
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-white/30 mb-3">Elegí tu plan</p>
            <h2 className="font-headline text-4xl lg:text-6xl font-black tracking-tighter uppercase mb-4">
              EMPEZÁ TU<br /><span className="text-[#c1ed00] italic">TRANSFORMACIÓN.</span>
            </h2>
            <p className="text-on-surface-variant max-w-lg text-base leading-relaxed font-body">
              Entrenamiento personalizado, seguimiento real y un coach que te acompaña. Elegí el plan que mejor se adapte a tus objetivos.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16 items-start max-w-4xl mx-auto">
            {[
              {
                id: 'monthly', name: 'PLAN BASE', price: 44999, days: 30, badge: null, color: '#c1ed00',
                desc: 'La forma más simple de empezar tu transformación.',
                features: [
                  'Rutina personalizada',
                  'App exclusiva Android e iPhone',
                  'Videos explicativos de cada ejercicio',
                  'Seguimiento semanal',
                  'Soporte en plataforma',
                  'Comunidad privada',
                  'Consultas nutricionales',
                  'Acompañamiento psicológico',
                ],
                priceNote: 'Trimestral $119.999 · Semestral $219.999',
              },
              {
                id: 'mentoria', name: 'MENTORÍA 1 A 1', price: 0, days: 0, badge: 'CUPOS LIMITADOS', color: '#ff734a',
                desc: 'Trabajá directamente con Ale Gerez para lograr un cambio real y definitivo.',
                features: [
                  'Comunicación directa todos los días',
                  '100% personalizado a vos',
                  'Estrategia alimentaria individualizada',
                  'Seguimiento de comidas',
                  'Ajustes permanentes',
                  'Sesiones individuales',
                  'Prioridad en la respuesta',
                  'App exclusiva Android e iPhone',
                  'Comunidad privada',
                  'Consultas nutricionales',
                  'Acompañamiento psicológico',
                ],
              },
            ].map((plan) => (
              <PricingCard key={plan.id} plan={plan} locale={locale} activeSub={activeSub} />
            ))}
          </div>

          {/* Trust */}
          <div className="flex flex-wrap justify-center gap-8 text-white/30 text-xs font-label uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#c1ed00]" />
              Acceso inmediato al pagar
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00e3fd]" />
              Pago seguro con Mercado Pago
            </span>
            <span className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#ff734a]" />
              Soporte por WhatsApp incluido
            </span>
          </div>
        </div>
      </section>

      {/* ── Transformaciones ──────────────────────────────────────── */}
      <section id="transformations" className="py-24 px-6 bg-[#000000] relative overflow-hidden scroll-mt-24">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6"
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
            <p className="font-body text-on-surface-variant text-sm leading-relaxed italic md:text-right max-w-xs">
              Esto no es teoría. Son personas que ya hicieron el proceso y hoy viven distinto.
            </p>
          </motion.div>

          <Carousel opts={{ align: 'start', loop: true }} className="w-full">
            <CarouselContent className="flex gap-6">
              {transformations.map((item) => {
                const quote = item.clientDetail?.[locale as 'es' | 'en' | 'pt'] ?? item.clientDetail?.es ?? ''
                return (
                  <CarouselItem
                    key={item.clientName}
                    className="basis-full md:basis-1/2 lg:basis-1/3 flex-shrink-0"
                  >
                    <div className="flex flex-col h-full">
                      <div className="grid grid-cols-2 gap-4 mb-6 group overflow-hidden">
                        <div className="relative overflow-hidden aspect-[4/5] bg-surface-container">
                          <Image
                            alt={`${item.clientName} - Antes`}
                            className="object-cover opacity-90 group-hover:opacity-100 transition-all duration-700"
                            src={item.beforeImage}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                          <div className="absolute bottom-3 left-3 bg-[#0e0e0e]/85 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-white/10 font-label">
                            Antes
                          </div>
                        </div>
                        <div className="relative overflow-hidden aspect-[4/5] bg-surface-container">
                          <Image
                            alt={`${item.clientName} - Después`}
                            className="object-cover group-hover:scale-105 transition-all duration-700"
                            src={item.afterImage}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                          <div className="absolute bottom-3 right-3 bg-[#c1ed00] text-[#0e0e0e] px-3 py-1 text-[10px] font-bold uppercase tracking-widest font-label">
                            Después
                          </div>
                        </div>
                      </div>
                      <div className="border-l-2 border-[#c1ed00] pl-6 py-2 flex-1">
                        <h4 className="font-headline text-2xl font-bold uppercase tracking-tight text-white mb-2">
                          {item.clientName}
                        </h4>
                        <blockquote className="font-body text-on-surface-variant italic text-sm leading-relaxed">
                          {quote}
                        </blockquote>
                      </div>
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <div className="flex justify-between items-center mt-8">
              <CarouselPrevious className="static translate-x-0 translate-y-0" />
              <CarouselNext className="static translate-x-0 translate-y-0" />
            </div>
          </Carousel>

          {/* CTA */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-headline text-2xl lg:text-3xl font-bold uppercase tracking-tight mb-6">
              Vos podés ser el <span className="text-[#c1ed00] italic">próximo caso</span>
            </p>
            <a
              href="#pricing"
              onClick={smoothScroll}
              className="inline-flex items-center gap-3 bg-[#cefc22] text-[#3b4a00] font-headline font-extrabold px-8 py-4 text-base lg:text-lg tracking-tight hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(206,252,34,0.3)] active:scale-[0.98] transition-all duration-300 uppercase"
            >
              ¡VER PLANES!
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-surface-container-low">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            className="mb-14 space-y-2"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp} custom={0}
          >
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-white/30">Preguntas frecuentes</p>
            <h2 className="font-headline text-3xl lg:text-4xl font-bold tracking-tighter uppercase italic">FAQ</h2>
            <div className="w-12 h-1 bg-[#00e3fd]" />
          </motion.div>

          <div className="space-y-0 divide-y divide-white/8">
            {[
              {
                q: '¿Necesito experiencia previa?',
                a: 'No. Adaptamos el entrenamiento a tu nivel, sea cual sea tu punto de partida. El Método R3SET está diseñado para acompañarte desde donde estés.',
              },
              {
                q: '¿Cómo funciona el seguimiento?',
                a: 'A través de la app registrás tus entrenamientos, tu progreso y tus comidas. Cada semana revisamos cómo vas y ajustamos lo que sea necesario para que el proceso no se detenga.',
              },
              {
                q: '¿Qué incluye el acompañamiento nutricional y psicológico?',
                a: 'Contamos con profesionales especializados que te acompañan en los tres pilares del Método: mente, cuerpo y alimentación. No es solo entrenamiento; es un proceso integral.',
              },
              {
                q: '¿Cuál es la diferencia entre el Plan Base y la Mentoría 1 a 1?',
                a: 'El Plan Base incluye entrenamiento personalizado, seguimiento semanal, app exclusiva y soporte en plataforma. La Mentoría 1 a 1 incluye todo eso más comunicación directa diaria con Ale Gerez, un programa 100% a medida y ajustes permanentes.',
              },
              {
                q: '¿Cuándo obtengo acceso?',
                a: 'Con el Plan Base, el acceso es inmediato al confirmar el pago. Con la Mentoría 1 a 1, primero completás una solicitud de evaluación y dentro de las 24 hs hábiles te contactamos para coordinar el inicio.',
              },
              {
                q: '¿Puedo cancelar cuando quiero?',
                a: 'Sí. No hay permanencias ni penalizaciones. Podés cancelar cuando quieras.',
              },
              {
                q: '¿Por qué el Método R3SET es diferente?',
                a: 'Ale Gerez llegó a pesar más de 160 kg y atravesó personalmente el proceso de transformación. No enseña desde la teoría, sino desde la experiencia real. Eso cambia todo.',
              },
              {
                q: '¿Cómo sé qué plan es el adecuado para mí?',
                a: 'Si querés empezar a trabajar de manera estructurada con seguimiento y soporte, el Plan Base es el camino. Si buscás algo más personalizado con acompañamiento directo, la Mentoría 1 a 1 es para vos.',
              },
            ].map(({ q, a }, i) => (
              <FAQItem key={i} question={q} answer={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacto ──────────────────────────────────────────────── */}
      <section id="contact" className="py-24 px-6 bg-[#0e0e0e]">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-14 space-y-2"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp} custom={0}
          >
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-white/30">¿Tenés dudas?</p>
            <h2 className="font-headline text-3xl lg:text-4xl font-bold tracking-tighter uppercase italic">HABLEMOS.</h2>
            <div className="w-12 h-1 bg-[#ff734a] mx-auto" />
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
            className="text-center font-label text-[10px] text-white/25 uppercase tracking-widest mt-8"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Respondemos dentro de las 24 hs · Sin compromiso
          </motion.p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section id="cta" className="py-24 px-6 text-center bg-surface-container-low border-y border-[#484847]/10 relative overflow-hidden">
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
            className="font-headline text-lg lg:text-2xl font-bold uppercase tracking-tight text-white/80 mb-6"
            variants={fadeUp}
            custom={1}
          >
            Es momento de <span className="text-[#c1ed00] italic">recodificar</span> tus hábitos.
          </motion.p>
          <motion.p
            className="text-on-surface-variant mb-10 max-w-md mx-auto font-body leading-relaxed"
            variants={fadeUp}
            custom={2}
          >
            Sumate a la mentoría 1-1 del método R3SET y empezá a construir resultados que sí puedas sostener.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="flex flex-col items-center gap-4">
            <a
              href="#contact"
              onClick={smoothScroll}
              className="inline-flex items-center gap-3 bg-[#cefc22] text-[#3b4a00] font-headline font-extrabold px-10 py-5 text-base lg:text-lg tracking-tight hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(206,252,34,0.3)] active:scale-[0.98] transition-all duration-300 uppercase"
            >
              SOLICITAR EVALUACIÓN
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="font-label text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-white/40">
              Cupos limitados <span className="text-[#c1ed00]/60 mx-1">•</span> Acceso online <span className="text-[#c1ed00]/60 mx-1">•</span> Empezá ya
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <motion.footer
        className="w-full py-12 px-6 border-t border-[#484847]/15 bg-[#000000] flex flex-col md:flex-row justify-between items-center gap-6 pb-20 md:pb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-[#D1FF26] font-black font-headline text-xl tracking-tighter uppercase">METODO R3SET</span>
          <p className="font-label text-xs uppercase text-white/30 tracking-widest">© {new Date().getFullYear()} METODO R3SET. TODOS LOS DERECHOS RESERVADOS.</p>
        </div>
        <div className="flex gap-8">
          <a href="#" className="font-label text-xs uppercase text-white/30 hover:text-white transition-colors duration-300">Privacidad</a>
          <a href="#" className="font-label text-xs uppercase text-white/30 hover:text-white transition-colors duration-300">Términos</a>
          <a href="#" className="font-label text-xs uppercase text-white/30 hover:text-white transition-colors duration-300">Contacto</a>
        </div>
        <div className="flex gap-4">
          <Share2 className="w-5 h-5 text-white/30 hover:text-[#00e3fd] transition-colors duration-300 cursor-pointer" />
          <Megaphone className="w-5 h-5 text-white/30 hover:text-[#00e3fd] transition-colors duration-300 cursor-pointer" />
        </div>
      </motion.footer>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full grid grid-cols-5 items-center h-16 bg-[#0e0e0e]/95 backdrop-blur-xl z-40 border-t border-white/5">
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
    </V4SplashManager>
  )
}
