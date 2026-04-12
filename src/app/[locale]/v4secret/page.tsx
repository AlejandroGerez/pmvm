'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import V4SplashManager from '@/components/v4/V4SplashScreen'
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface ActiveSub { plan_id: string }

/* ── Pricing Card ──────────────────────────────────────────── */
function PricingCard({ plan, locale, activeSub }: { plan: any; locale: string; activeSub: ActiveSub | null }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Determine state relative to active subscription
  const isCurrent = activeSub?.plan_id === plan.id
  const planTier = { monthly: 1, quarterly: 2, semiannual: 3 }
  const currentTier = activeSub ? (planTier[activeSub.plan_id as keyof typeof planTier] ?? 0) : 0
  const thisTier = planTier[plan.id as keyof typeof planTier] ?? 0
  const isUpgrade = activeSub && thisTier > currentTier
  const isTopPlan = plan.id === 'semiannual'
  const hasActiveSub = !!activeSub

  let btnLabel = 'COMPRAR AHORA'
  if (hasActiveSub) {
    if (isCurrent) btnLabel = 'RENOVAR PLAN'
    else if (isUpgrade && isTopPlan) btnLabel = 'PLAN COMPLETO'
    else if (isUpgrade) btnLabel = 'MEJORAR PLAN'
    else btnLabel = 'CAMBIAR PLAN'
  }

  const handleBuy = () => {
    router.push(`/${locale}/checkout?plan=${plan.id}`)
  }

  // Semiannual subscriber sees a "complete" state, no need to push more
  const isComplete = activeSub?.plan_id === 'semiannual' && plan.id === 'semiannual'

  return (
    <div className={`relative flex flex-col rounded-none p-6 lg:p-8 border transition-all duration-300 hover:-translate-y-1 ${
      plan.badge === 'MÁS POPULAR'
        ? 'border-[#c1ed00]/40 bg-[#c1ed00]/[0.04] shadow-[0_0_50px_rgba(193,237,0,0.08)] scale-[1.02]'
        : 'border-white/10 bg-surface-container hover:border-white/20'
    }`}>
      {/* Badge: active plan indicator overrides default badge */}
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

      <p className="font-label text-xs font-bold tracking-widest uppercase mb-2" style={{ color: plan.color }}>{plan.days} días</p>
      <h3 className="font-headline text-2xl font-black mb-3">{plan.name}</h3>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-sm text-white/40 font-label">ARS</span>
        <span className="font-headline text-4xl font-black">${plan.price.toLocaleString('es-AR')}</span>
      </div>
      <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-body">{plan.desc}</p>
      <ul className="space-y-2.5 mb-8 flex-1">
        {plan.features.map((f: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant font-body">
            <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0" style={{ color: plan.color }}>check</span>
            {f}
          </li>
        ))}
      </ul>
      {error && <p className="text-red-400 text-xs mb-3 text-center bg-red-400/10 rounded py-2 px-3 font-label">{error}</p>}

      {isComplete ? (
        <div className="w-full py-3.5 text-center font-headline font-black text-sm tracking-widest uppercase border border-white/10 text-white/30">
          ✓ YA TENÉS EL MEJOR PLAN
        </div>
      ) : (
        <button onClick={handleBuy} disabled={loading}
          className="w-full py-3.5 font-headline font-black text-sm tracking-widest uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          style={{ backgroundColor: loading ? '#333' : plan.color, color: '#0e0e0e' }}>
          {loading ? 'PROCESANDO...' : btnLabel}
        </button>
      )}
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

/* ── Animated Counter ──────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 2000
          const start = performance.now()
          const update = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            el.textContent = Math.floor(eased * target) + suffix
            if (progress < 1) requestAnimationFrame(update)
          }
          requestAnimationFrame(update)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, suffix])

  return <span ref={ref}>0{suffix}</span>
}

export default function V4Page() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'es'
  const router = useRouter()

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
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
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
  }, [])

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => {
      setNavSolid(v > 80)
      if (v > 80) setMobileMenuOpen(false)
    })
    return unsub
  }, [scrollY])

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
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
                              <p className="text-xs text-[#c1ed00] font-bold capitalize">{activeSub.plan_id}</p>
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
                <div className="flex items-center gap-2">
                  <Link href={`/${locale}/login`}
                    className="text-[11px] font-semibold tracking-widest uppercase text-white/50 hover:text-white transition-colors px-3 py-2 border border-white/15 hover:border-white/30 rounded">
                    Login
                  </Link>
                  <Link href={`/${locale}/register`}
                    className="bg-[#cefc22] text-[#3b4a00] px-5 py-2 font-headline font-bold text-xs tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all">
                    Comenzar
                  </Link>
                </div>
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
                              <p className="text-[10px] text-[#c1ed00]/70 uppercase tracking-widest">Plan {activeSub.plan_id} activo</p>
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
                      <div className="flex flex-col gap-2">
                        <Link href={`/${locale}/login`} onClick={() => setMobileMenuOpen(false)}
                          className="text-center py-3.5 border border-white/15 text-sm font-bold tracking-widest uppercase text-white/70 hover:text-white rounded">
                          Iniciar sesión
                        </Link>
                        <Link href={`/${locale}/register`} onClick={() => setMobileMenuOpen(false)}
                          className="text-center py-3.5 bg-[#c1ed00] text-[#0e0e0e] text-sm font-black tracking-widest uppercase rounded">
                          Comenzar ahora
                        </Link>
                      </div>
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
            Un santuario digital de alto rendimiento diseñado para resetear tu esquema mental y físico a través de pilares respaldados por la ciencia.
          </motion.p>
          <motion.div
            className="pt-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <Link
              href={`/${locale}/register`}
              className="inline-flex items-center gap-3 bg-[#cefc22] text-[#3b4a00] font-headline font-extrabold px-8 py-4 text-base lg:text-lg tracking-tight hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(206,252,34,0.3)] active:scale-[0.98] transition-all duration-300 uppercase"
            >
              COMENZAR MI R3SET
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
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
              No solo contamos calorías. Reconstruimos el sistema humano a través de la convergencia de ciencia y psicología.
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
                <span className="material-symbols-outlined text-[#ff734a] text-4xl mb-4 block">psychology</span>
                <h3 className="font-headline text-2xl font-bold uppercase mb-2">Psicología</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
                  Reconectá los patrones cognitivos que llevan al auto-sabotaje. Resiliencia mental y arquitectura de hábitos.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Modelos Mentales', 'Hábitos', 'Detox Dopamina'].map((tag) => (
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
                <span className="material-symbols-outlined text-[#c1ed00] text-4xl">fitness_center</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-headline text-xl font-bold uppercase mb-2">Entrenamiento</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Movimiento funcional para la longevidad. Sesiones de alta intensidad que respetan tu biología.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Fuerza', 'Movilidad'].map((tag) => (
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
                <span className="material-symbols-outlined text-[#00e3fd] text-4xl">restaurant</span>
              </div>
              <div className="relative z-10 flex-1">
                <h3 className="font-headline text-xl font-bold uppercase mb-2">Nutrición</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-lg">
                  Combustible de precisión sin restricción. Optimización metabólica basada en ciencia. No contamos calorías — construimos sistemas.
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
                <span className="font-label text-[#3b4a00] block text-xs font-bold tracking-[0.4em] mt-1">SYSTEM</span>
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
                  { n: '01', t: 'Recodificación', d: 'Identificamos los patrones subconscientes que frenan tu progreso. Reparamos la mentalidad antes de tocar una sola pesa.' },
                  { n: '02', t: 'Reconstrucción', d: 'Introducción del protocolo de entrenamiento y la arquitectura nutricional sobre el nuevo marco mental.' },
                  { n: '03', t: 'R3SET', d: 'Estabilización. No es un desafío con fecha de fin — es tu nuevo estado de rendimiento base.' },
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
              {/* Image wrapper with overflow-hidden so scale hover stays clipped */}
              <div className="aspect-[4/5] bg-surface-container overflow-hidden">
                <motion.img
                  src="https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=80&auto=format&fit=crop"
                  alt="Alejandro Gerez - Head Coach"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              {/* Badge OUTSIDE the overflow-hidden wrapper so it's fully visible */}
              <motion.div
                className="absolute -bottom-5 -right-5 bg-[#00e3fd] text-[#003a42] px-5 py-3 font-headline font-black text-sm uppercase tracking-tighter z-10"
                initial={{ x: 60, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
              >
                EXPERTISE: 12+ AÑOS
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
                CONOCÉ A ALE:<br /><span className="text-[#c1ed00] italic">ALEJANDRO GEREZ</span>
              </h2>
              <p className="text-on-surface-variant leading-relaxed font-body">
                Alejandro fundó METODO R3SET para cerrar la brecha entre la psicología clínica y el rendimiento atlético. Ex participante de Cuestión de Peso y creador de PMVM, trae un enfoque holístico a la transformación sostenible.
              </p>
              <motion.ul
                className="space-y-3 font-label text-xs uppercase tracking-widest text-white/60"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {['Psicología del Deporte', 'Nutricionista Certificado (ISSN)', 'Performance Coach Specialist'].map((item) => (
                  <motion.li key={item} className="flex items-center gap-3" variants={staggerItem}>
                    <span className="w-1.5 h-1.5 bg-[#c1ed00] flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-surface-container-low overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {[
              { value: 200, prefix: '+', suffix: '', label: 'Clientes Transformados' },
              { value: 3, prefix: '', suffix: '', label: 'Pilares del Método' },
              { value: 12, prefix: '', suffix: '', label: 'Semanas de Programa' },
              { value: 95, prefix: '', suffix: '%', label: 'Retención de Resultados' },
            ].map(({ value, prefix, suffix, label }) => (
              <motion.div key={label} className="text-center p-6 lg:p-8" variants={staggerItem}>
                <span className="font-headline text-4xl lg:text-6xl font-black text-[#c1ed00] block mb-2">
                  {prefix}<AnimatedCounter target={value} suffix={suffix} />
                </span>
                <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{label}</span>
              </motion.div>
            ))}
          </motion.div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {[
              {
                id: 'monthly', name: 'Plan Mensual', price: 100, days: 30, badge: null, color: '#00e3fd',
                desc: 'Perfecto para empezar. Un mes de entrenamiento personalizado.',
                features: ['Rutina personalizada en tu dashboard', 'Seguimiento semanal de progreso', 'Chat directo con tu coach', 'Acceso al dashboard personal'],
              },
              {
                id: 'quarterly', name: 'Plan Trimestral', price: 150, days: 90, badge: 'MÁS POPULAR', color: '#c1ed00',
                desc: '3 meses para construir hábitos reales. Ahorrás $10.000.',
                features: ['Todo lo del plan mensual', 'Actualizaciones de rutina c/4 semanas', 'Análisis de progreso mensual', 'Prioridad de respuesta del coach'],
              },
              {
                id: 'semiannual', name: 'Plan Semestral', price: 200, days: 180, badge: 'MEJOR VALOR', color: '#ff734a',
                desc: '6 meses de transformación completa. El camino definitivo.',
                features: ['Todo lo del plan trimestral', 'Plan nutricional básico incluido', 'Check-in quincenal por videollamada', 'Comunidad privada de alumnos'],
              },
            ].map((plan) => (
              <PricingCard key={plan.id} plan={plan} locale={locale} activeSub={activeSub} />
            ))}
          </div>

          {/* Trust */}
          <div className="flex flex-wrap justify-center gap-8 text-white/30 text-xs font-label uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#c1ed00]">bolt</span>
              Acceso inmediato al pagar
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#00e3fd]">shield</span>
              Pago seguro con Mercado Pago
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#ff734a]">chat</span>
              Soporte por WhatsApp incluido
            </span>
          </div>
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
            className="font-headline text-4xl lg:text-5xl font-bold tracking-tighter uppercase mb-6"
            variants={fadeUp}
            custom={0}
          >
            ¿LISTO PARA <span className="text-[#c1ed00]" style={{ textShadow: '0 0 30px rgba(193,237,0,0.4)' }}>RECODIFICAR</span> TU SISTEMA?
          </motion.h2>
          <motion.p
            className="text-on-surface-variant mb-10 max-w-md mx-auto font-body"
            variants={fadeUp}
            custom={1}
          >
            Unite al próximo cohorte del programa de transformación R3SET.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link
              href={`/${locale}/register`}
              className="inline-block border-2 border-[#00e3fd] text-[#00e3fd] font-headline font-bold px-10 py-5 hover:bg-[#00e3fd] hover:text-[#003a42] hover:shadow-[0_0_40px_rgba(0,227,253,0.3)] transition-all duration-500 active:scale-95 uppercase tracking-widest"
            >
              ACCESO ANTICIPADO
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <motion.footer
        className="w-full py-12 px-6 border-t border-[#484847]/15 bg-[#000000] flex flex-col md:flex-row justify-between items-center gap-6 pb-24 md:pb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-[#D1FF26] font-black font-headline text-xl tracking-tighter uppercase">METODO R3SET</span>
          <p className="font-label text-xs uppercase text-white/30 tracking-widest">© 2025 METODO R3SET. TODOS LOS DERECHOS RESERVADOS.</p>
        </div>
        <div className="flex gap-8">
          <a href="#" className="font-label text-xs uppercase text-white/30 hover:text-white transition-colors duration-300">Privacidad</a>
          <a href="#" className="font-label text-xs uppercase text-white/30 hover:text-white transition-colors duration-300">Términos</a>
          <a href="#" className="font-label text-xs uppercase text-white/30 hover:text-white transition-colors duration-300">Contacto</a>
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-white/30 hover:text-[#00e3fd] transition-colors duration-300 cursor-pointer">share</span>
          <span className="material-symbols-outlined text-white/30 hover:text-[#00e3fd] transition-colors duration-300 cursor-pointer">brand_awareness</span>
        </div>
      </motion.footer>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 bg-[#0e0e0e]/95 backdrop-blur-xl z-40 border-t border-white/5">
        <a href="#method" onClick={smoothScroll} className="flex flex-col items-center justify-center text-[#D1FF26] pt-2 active:scale-90 transition-all">
          <span className="material-symbols-outlined">psychology</span>
          <span className="font-label text-[10px] uppercase tracking-widest mt-1">Método</span>
        </a>
        <a href="#coach" onClick={smoothScroll} className="flex flex-col items-center justify-center text-white/40 pt-2 active:scale-90 transition-all">
          <span className="material-symbols-outlined">fitness_center</span>
          <span className="font-label text-[10px] uppercase tracking-widest mt-1">Coach</span>
        </a>
        <a href="#pricing" onClick={smoothScroll} className="flex flex-col items-center justify-center text-white/40 pt-2 active:scale-90 transition-all">
          <span className="material-symbols-outlined">bolt</span>
          <span className="font-label text-[10px] uppercase tracking-widest mt-1">Planes</span>
        </a>
        {user ? (
          <Link href={`/${locale}/dashboard`} className="flex flex-col items-center justify-center text-[#c1ed00]/70 pt-2 active:scale-90 transition-all">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label text-[10px] uppercase tracking-widest mt-1">Mi Área</span>
          </Link>
        ) : (
          <Link href={`/${locale}/register`} className="flex flex-col items-center justify-center text-white/40 pt-2 active:scale-90 transition-all">
            <span className="material-symbols-outlined">person_add</span>
            <span className="font-label text-[10px] uppercase tracking-widest mt-1">Unirse</span>
          </Link>
        )}
      </nav>
    </V4SplashManager>
  )
}
