'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const card = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
}

interface Props {
  locale: string
  totalClients: number
  unreadMessages: number
  recentClients: any[]
  recentProgress: any[]
}

export default function AdminDashboardClient({
  locale, totalClients, unreadMessages, recentClients, recentProgress,
}: Props) {
  const t = useTranslations('app')
  const dateLocale = locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'es-AR'

  const stats = [
    {
      icon: 'group',
      iconColor: '#c1ed00',
      label: t('admin.stat_clients'),
      value: String(totalClients),
      ghost: totalClients,
      link: `/${locale}/admin/clients`,
      linkLabel: t('admin.link_view_all'),
      linkIcon: 'trending_up',
      linkColor: '#c1ed00',
      urgency: null,
    },
    {
      icon: 'chat',
      iconColor: '#00e3fd',
      label: t('admin.stat_messages'),
      value: String(unreadMessages).padStart(2, '0'),
      ghost: unreadMessages,
      link: `/${locale}/admin/messages`,
      linkLabel: t('admin.link_attention'),
      linkIcon: 'priority_high',
      linkColor: '#00e3fd',
      urgency: unreadMessages > 0 ? 'cyan' : null,
    },
    {
      icon: 'monitoring',
      iconColor: '#ff734a',
      label: t('admin.stat_progress'),
      value: String(recentProgress?.length ?? 0),
      ghost: recentProgress?.length ?? 0,
      link: `/${locale}/admin/clients`,
      linkLabel: t('admin.link_recent'),
      linkIcon: 'check_circle',
      linkColor: '#ff734a',
      urgency: null,
    },
  ]

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white">
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#c1ed00]/5 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[#00e3fd]/4 blur-[160px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 px-6 lg:px-12 py-10 lg:py-12 max-w-7xl mx-auto">

        {/* Editorial header */}
        <motion.div
          className="mb-10 lg:mb-12"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            className="font-label text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2"
            variants={fadeUp}
            custom={0}
          >
            {t('admin.overview')}
          </motion.p>
          <motion.h2
            className="text-5xl lg:text-7xl font-headline font-black tracking-tighter text-white leading-none -ml-0.5"
            variants={fadeUp}
            custom={1}
          >
            {t('admin.panel_line1')}<br /><span className="text-[#c1ed00]">{t('admin.panel_line2')}</span>
          </motion.h2>
          <motion.div
            className="mt-6 h-px bg-gradient-to-r from-[#c1ed00]/40 via-white/10 to-transparent"
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          />
        </motion.div>

        {/* Bento Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-12"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {stats.map(({ icon, iconColor, label, value, ghost, link, linkLabel, linkIcon, linkColor, urgency }) => (
            <motion.div
              key={label}
              className="bg-surface-container-low p-6 lg:p-8 relative overflow-hidden group cursor-default"
              variants={card}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
            >
              <motion.div
                className="absolute inset-0 border border-transparent group-hover:border-white/10 transition-colors duration-300"
                style={{ borderColor: urgency ? `${iconColor}30` : undefined }}
              />
              <span
                className="material-symbols-outlined mb-4 text-3xl block"
                style={{ color: iconColor, fontVariationSettings: "'FILL' 1" }}
              >
                {icon}
              </span>
              <p className="font-label text-[10px] text-white/30 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-5xl lg:text-6xl font-headline font-black text-white">{value}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" style={{ color: linkColor }}>{linkIcon}</span>
                <Link href={link} className="font-label text-[10px] uppercase tracking-widest hover:underline" style={{ color: linkColor }}>
                  {linkLabel}
                </Link>
              </div>
              <div className="absolute -bottom-4 -right-4 text-white/[0.04] font-black text-8xl font-headline pointer-events-none select-none">
                {ghost}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Activity feed */}
          <motion.div
            className="lg:col-span-8 bg-surface-container-low p-6 lg:p-8"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">{t('admin.feed_label')}</p>
                <h3 className="font-headline text-lg font-bold uppercase tracking-tight">
                  {t('admin.feed_title')}
                </h3>
              </div>
              <span className="px-2 py-1 bg-[#c1ed00]/10 text-[#c1ed00] font-label text-[9px] uppercase tracking-widest">Live</span>
            </div>
            {recentProgress.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center py-16 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <span className="material-symbols-outlined text-4xl text-white/10">monitoring</span>
                <p className="text-white/30 text-sm font-label uppercase tracking-widest">{t('admin.no_progress')}</p>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-3"
                variants={stagger}
                initial="hidden"
                animate="visible"
              >
                {recentProgress.map((p: any, i: number) => (
                  <motion.div
                    key={p.id}
                    className="flex items-center gap-4 p-3 bg-[#0e0e0e]/60 hover:bg-[#0e0e0e] transition-colors duration-200 group"
                    variants={card}
                    custom={i}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-8 h-8 bg-[#c1ed00]/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[#c1ed00] text-sm">trending_up</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label text-xs text-white truncate">{(p.profiles as any)?.full_name ?? t('admin.no_name')}</p>
                      <p className="font-label text-[10px] text-white/30 uppercase tracking-widest">
                        {p.weight_kg ? `${p.weight_kg} kg` : t('admin.new_record')}
                      </p>
                    </div>
                    <p className="font-label text-[10px] text-white/20 flex-shrink-0">
                      {new Date(p.created_at).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short' })}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* New clients */}
          <motion.div
            className="lg:col-span-4 bg-surface-container-low p-6 lg:p-8"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <div className="mb-6">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">{t('admin.new_clients_label')}</p>
              <h3 className="font-headline text-lg font-bold uppercase tracking-tight">{t('admin.new_clients_title')}</h3>
            </div>
            {recentClients.length === 0 ? (
              <motion.p
                className="text-white/30 text-sm font-label uppercase tracking-widest text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {t('admin.no_clients')}
              </motion.p>
            ) : (
              <motion.div
                className="space-y-3"
                variants={stagger}
                initial="hidden"
                animate="visible"
              >
                {recentClients.map((c: any, i: number) => {
                  const initials = (c.full_name ?? 'U').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <motion.div
                      key={c.id}
                      className="flex items-center gap-3 group"
                      variants={card}
                      custom={i}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-8 h-8 bg-[#c1ed00] flex items-center justify-center text-[#3b4a00] font-headline font-black text-xs flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-label text-xs text-white truncate">{c.full_name ?? t('admin.no_name')}</p>
                        <p className="font-label text-[10px] text-white/30">
                          {new Date(c.created_at).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
            <motion.div
              className="mt-6 flex flex-col gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Link
                href={`/${locale}/admin/clients`}
                className="w-full flex items-center justify-center gap-2 bg-[#cefc22] text-[#3b4a00] py-3 font-headline font-bold text-xs uppercase tracking-wide hover:opacity-90 active:scale-[0.98] transition-all duration-200"
              >
                <span className="material-symbols-outlined text-sm">group_add</span>
                {t('admin.btn_clients')}
              </Link>
              <Link
                href={`/${locale}/admin/subscriptions`}
                className="w-full flex items-center justify-center gap-2 border border-[#c1ed00]/30 text-[#c1ed00] py-3 font-headline font-bold text-xs uppercase tracking-wide hover:bg-[#c1ed00]/5 transition-all duration-200"
              >
                <span className="material-symbols-outlined text-sm">payments</span>
                {t('admin.btn_subscriptions')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
