'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface Props {
  locale: string
  profile: any
  userEmail: string
}

export default function ClientSidebar({ locale, profile, userEmail }: Props) {
  const pathname = usePathname()
  const t = useTranslations('app')

  const navItems = [
    { href: 'dashboard',          label: t('nav.home'),          icon: 'home' },
    { href: 'dashboard/goals',    label: t('nav.goals'),         icon: 'track_changes' },
    { href: 'dashboard/routines', label: t('nav.routines'),      icon: 'fitness_center' },
    { href: 'dashboard/messages', label: t('nav.messages'),      icon: 'chat' },
    { href: 'dashboard/progress', label: t('nav.progress'),      icon: 'monitoring' },
  ]

  const initials = (profile?.full_name ?? userEmail)
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-[#0e0e0e] border-r border-white/5 h-screen overflow-y-auto hide-scrollbar">

      {/* Brand */}
      <div className="px-5 pt-7 pb-5 border-b border-white/5">
        <Link href={`/${locale}/v4secret`}>
          <span className="text-lg font-black font-headline text-[#c1ed00] tracking-[-0.04em] uppercase italic leading-none">
            METODO R3SET
          </span>
        </Link>
        <p className="font-label text-[9px] uppercase tracking-[0.2em] text-white/25 mt-1">{t('sidebar.my_area')}</p>
      </div>

      {/* Profile chip */}
      <Link href={`/${locale}/dashboard/profile`} className="px-4 py-4 border-b border-white/5 flex items-center gap-3 group cursor-pointer">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="w-8 h-8 object-cover flex-shrink-0 group-hover:opacity-80 transition-opacity"
          />
        ) : (
          <div className="w-8 h-8 bg-[#c1ed00] group-hover:bg-white transition-colors flex items-center justify-center text-[#3b4a00] font-headline font-black text-xs flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-label text-xs text-white truncate leading-none">
            {profile?.full_name ?? 'Mi Perfil'}
          </p>
          <p className="font-label text-[9px] text-[#c1ed00] group-hover:text-white/40 transition-colors truncate mt-0.5">
            {t('sidebar.my_profile_link')}
          </p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon }) => {
          const fullHref = `/${locale}/${href}`
          const isActive = pathname === fullHref || (href !== 'dashboard' && pathname.startsWith(fullHref))
          return (
            <Link
              key={href}
              href={fullHref}
              className={`flex items-center gap-3 px-3 py-2.5 font-label text-[11px] uppercase tracking-widest transition-all duration-200 group ${
                isActive
                  ? 'bg-[#cefc22] text-[#3b4a00]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6 space-y-1 border-t border-white/5 pt-4">
        <Link
          href={`/${locale}/v4secret`}
          className="flex items-center gap-3 px-3 py-2.5 font-label text-[11px] uppercase tracking-widest text-white/25 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">public</span>
          {t('sidebar.view_landing')}
        </Link>
        <form action={`/api/auth/signout`} method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 font-label text-[11px] uppercase tracking-widest text-white/25 hover:text-white transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            {t('sidebar.sign_out')}
          </button>
        </form>
      </div>
    </aside>
  )
}
