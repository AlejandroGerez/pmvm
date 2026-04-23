'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const card = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
}
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
})

interface ActiveSub {
  id: string
  plan_id: string
  started_at: string | null
  expires_at: string | null
  plans: { name: string; duration_days: number } | null
}

interface Props {
  locale: string
  displayName: string
  routinesCount: number
  unreadMessages: number
  progressCount: number
  recentProgress: any[]
  activeSub: ActiveSub | null
}

export default function ClientDashboardHome({
  locale, displayName, routinesCount, unreadMessages, progressCount, recentProgress, activeSub,
}: Props) {
  const t = useTranslations('app')

  const stats = [
    { icon: 'fitness_center', color: '#c1ed00', label: t('home.stat_routines'),  value: routinesCount, href: `/${locale}/dashboard/routines` },
    { icon: 'contact_phone',  color: '#00e3fd', label: t('home.stat_messages'),  value: null,          href: `/${locale}/dashboard/messages` },
    { icon: 'monitoring',     color: '#ff734a', label: t('home.stat_weight'),    value: progressCount, href: `/${locale}/dashboard/progress` },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('greeting.morning') : hour < 19 ? t('greeting.afternoon') : t('greeting.evening')

  // Date locale for formatting
  const dateLocale = locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'es-AR'

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white relative overflow-hidden">
      {/* Ambient */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#c1ed00]/5 blur-[140px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#00e3fd]/4 blur-[140px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 px-6 lg:px-10 py-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <motion.p className="font-label text-[10px] uppercase tracking-[0.25em] text-white/30 mb-1" {...fadeUp(0.1)}>
            {greeting}
          </motion.p>
          <motion.h1
            className="font-headline font-black text-5xl lg:text-6xl tracking-tighter leading-none"
            {...fadeUp(0.2)}
          >
            {displayName.split(' ')[0].toUpperCase()}<br />
            <span className="text-[#c1ed00] italic">R3SET.</span>
          </motion.h1>
          <motion.div
            className="mt-5 h-px bg-gradient-to-r from-[#c1ed00]/40 via-white/10 to-transparent"
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </div>

        {/* Subscription card */}
        {activeSub ? (
          <SubscriptionCard sub={activeSub} locale={locale} dateLocale={dateLocale} />
        ) : (
          <motion.div
            className="mb-8 p-4 border border-dashed border-white/15 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <div>
              <p className="font-label text-[10px] uppercase tracking-widest text-white/30 mb-1">{t('home.no_plan_label')}</p>
              <p className="text-white/60 text-sm">{t('home.no_plan_desc')}</p>
            </div>
            <Link
              href={`/${locale}#pricing`}
              className="flex-shrink-0 px-5 py-2.5 bg-[#c1ed00] text-[#0e0e0e] font-black text-xs uppercase tracking-widest rounded-lg hover:bg-[#d4ff00] transition-colors"
            >
              {t('home.see_plans')}
            </Link>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {stats.map(({ icon, color, label, value, href }) => (
            <motion.div
              key={label}
              variants={card}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={href}
                className="block bg-surface-container-low p-6 relative overflow-hidden group hover:bg-surface-container-high transition-colors duration-300"
              >
                <span
                  className="material-symbols-outlined text-3xl mb-3 block"
                  style={{ color, fontVariationSettings: "'FILL' 1" }}
                >
                  {icon}
                </span>
                <p className="font-label text-[10px] text-white/30 uppercase tracking-widest mb-1">{label}</p>
                {value !== null ? (
                  <>
                    <p className="font-headline font-black text-4xl text-white">{value}</p>
                    <div className="absolute -bottom-3 -right-3 text-white/[0.04] font-black text-7xl font-headline select-none pointer-events-none">
                      {value}
                    </div>
                  </>
                ) : (
                  <p className="font-label text-xs text-white/50 mt-1">Escribir al coach →</p>
                )}
                <div className="mt-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm" style={{ color }}>arrow_forward</span>
                  <span className="font-label text-[10px] uppercase tracking-widest" style={{ color }}>{t('home.see_more')}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent progress */}
        <motion.div
          className="bg-surface-container-low p-6 lg:p-8"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">{t('home.history_label')}</p>
              <h3 className="font-headline text-lg font-bold uppercase tracking-tight">{t('home.history_title')}</h3>
            </div>
            <Link href={`/${locale}/dashboard/progress`} className="font-label text-[10px] uppercase tracking-widest text-[#c1ed00] hover:underline">
              {t('home.see_all')}
            </Link>
          </div>

          {recentProgress.length === 0 ? (
            <motion.div
              className="flex flex-col items-center py-12 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="material-symbols-outlined text-4xl text-white/10">monitoring</span>
              <p className="font-label text-[10px] uppercase tracking-widest text-white/25">{t('home.no_records')}</p>
              <Link
                href={`/${locale}/dashboard/progress`}
                className="mt-2 px-5 py-2.5 bg-[#cefc22] text-[#3b4a00] font-headline font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                {t('home.first_record')}
              </Link>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-2"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              {recentProgress.map((p: any) => (
                <motion.div
                  key={p.id}
                  className="flex items-center gap-4 px-4 py-3 bg-[#0e0e0e]/60 hover:bg-[#0e0e0e] transition-colors group"
                  variants={card}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="material-symbols-outlined text-[#c1ed00] text-sm">trending_up</span>
                  <div className="flex-1">
                    <p className="font-label text-xs text-white">
                      {p.weight_kg ? `${p.weight_kg} kg` : t('admin.new_record')}
                    </p>
                  </div>
                  <p className="font-label text-[10px] text-white/25">
                    {new Date(p.created_at).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short' })}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Quick CTA */}
        <motion.div
          className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <Link
            href={`/${locale}/dashboard/routines`}
            className="flex items-center justify-center gap-2 py-4 border border-[#c1ed00]/30 text-[#c1ed00] font-headline font-bold text-sm uppercase tracking-widest hover:bg-[#c1ed00]/5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">fitness_center</span>
            {t('home.cta_routines')}
          </Link>
          <Link
            href={`/${locale}/dashboard/messages`}
            className="flex items-center justify-center gap-2 py-4 border border-[#00e3fd]/30 text-[#00e3fd] font-headline font-bold text-sm uppercase tracking-widest hover:bg-[#00e3fd]/5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            {t('home.cta_messages')}
          </Link>
        </motion.div>

      </div>
    </div>
  )
}

// ── Subscription card ──────────────────────────────────────────────────────
function SubscriptionCard({ sub, locale, dateLocale }: { sub: ActiveSub; locale: string; dateLocale: string }) {
  const t = useTranslations('app')
  const now = new Date()
  const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null
  const totalDays = sub.plans?.duration_days ?? 30

  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const progress = totalDays > 0 ? Math.round(((totalDays - daysRemaining) / totalDays) * 100) : 0

  const expiresFormatted = expiresAt?.toLocaleDateString(dateLocale, {
    day: 'numeric', month: 'long', year: 'numeric',
  }) ?? '—'

  const urgencyColor = daysRemaining <= 7 ? '#ff734a' : daysRemaining <= 14 ? '#ffcc00' : '#c1ed00'

  const isExpiringSoon = daysRemaining <= 7

  return (
    <motion.div
      className={`mb-8 relative overflow-hidden ${isExpiringSoon ? '' : ''}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
    >
      {/* Expiry warning banner */}
      {isExpiringSoon && (
        <div className="flex items-center gap-3 px-5 py-3 bg-[#ff734a]/15 border border-[#ff734a]/30 mb-0 text-sm">
          <span className="material-symbols-outlined text-[#ff734a] text-[18px] flex-shrink-0">warning</span>
          <p className="font-label text-xs uppercase tracking-widest text-[#ff734a]">
            {daysRemaining === 0
              ? 'Tu plan venció hoy — renovalo para no perder el acceso'
              : `Tu plan vence en ${daysRemaining} día${daysRemaining === 1 ? '' : 's'} — renovalo para continuar`}
          </p>
          <Link
            href={`/${locale}#pricing`}
            className="ml-auto flex-shrink-0 px-3 py-1.5 bg-[#ff734a] text-[#0e0e0e] font-black text-[10px] uppercase tracking-widest hover:bg-[#ff9060] transition-colors"
          >
            RENOVAR
          </Link>
        </div>
      )}

    <div className={`p-5 border relative overflow-hidden ${isExpiringSoon ? 'border-[#ff734a]/30 bg-[#ff734a]/[0.03]' : 'border-[#c1ed00]/20 bg-[#c1ed00]/3 rounded-2xl'}`}>
      <div className="absolute -top-10 -right-10 w-40 h-40 blur-3xl rounded-full pointer-events-none" style={{ backgroundColor: isExpiringSoon ? 'rgba(255,115,74,0.08)' : 'rgba(193,237,0,0.08)' }} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-[#c1ed00]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#c1ed00]">{t('home.plan_active')}</p>
            </div>
            <p className="font-black text-xl text-white">{sub.plans?.name ?? sub.plan_id}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{t('home.days_remaining')}</p>
            <p className="font-black text-3xl leading-none" style={{ color: urgencyColor }}>
              {daysRemaining}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
            <span>{t('home.plan_start')}</span>
            <span>{progress}{t('home.plan_completed')}</span>
            <span>{t('home.plan_expires')} {expiresFormatted}</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: urgencyColor }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {daysRemaining > 7 && daysRemaining <= 14 && (
          <Link
            href={`/${locale}#pricing`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#c1ed00] text-[#0e0e0e] font-black text-xs uppercase tracking-widest rounded-lg hover:bg-[#d4ff00] transition-colors"
          >
            {t('home.renew_plan')}
          </Link>
        )}
      </div>
    </div>
    </motion.div>
  )
}
