'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

interface AdminSidebarProps {
  locale: string
  adminName: string
  adminAvatarUrl?: string | null
}

export default function AdminSidebar({ locale, adminName, adminAvatarUrl }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('app')
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { href: 'admin',                 label: t('nav.dashboard'),      icon: 'dashboard' },
    { href: 'admin/goals',           label: t('nav.goals'),          icon: 'track_changes' },
    { href: 'admin/routines',        label: t('nav.routines'),       icon: 'fitness_center' },
    { href: 'admin/clients',         label: t('nav.clients'),        icon: 'group' },
    { href: 'admin/messages',        label: t('nav.messages'),       icon: 'chat' },
  ]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  const initials = adminName[0]?.toUpperCase() ?? 'A'

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0e0e0e] border-r border-white/5">
      <div className="px-6 pt-8 pb-4">
        <Link href={`/${locale}/v4`} className="block">
          <span className="text-xl font-black text-[#D1FF26] font-headline tracking-[-0.04em] uppercase italic">
            METODO R3SET
          </span>
        </Link>
        <p className="text-[10px] text-white/25 font-label tracking-widest uppercase mt-1">{t('sidebar.admin_portal')}</p>
      </div>

      <Link href={`/${locale}/admin/profile`} onClick={() => setMobileOpen(false)}
        className="px-6 pb-8 flex items-center gap-3 group cursor-pointer">
        {adminAvatarUrl ? (
          <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden group-hover:opacity-80 transition-opacity">
            <Image
              src={adminAvatarUrl}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-10 h-10 bg-[#cefc22] flex items-center justify-center text-[#3b4a00] font-black text-sm flex-shrink-0 font-headline group-hover:bg-white transition-colors">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-headline font-bold text-white uppercase tracking-tight truncate">{adminName}</p>
          <p className="text-[10px] text-[#c1ed00] font-label uppercase tracking-widest group-hover:text-white/50 transition-colors">
            {t('sidebar.trainer_profile')}
          </p>
        </div>
      </Link>

      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map((item) => {
          const href = `/${locale}/${item.href}`
          const isActive = pathname === href || (item.href !== 'admin' && pathname.startsWith(href))
          return (
            <Link
              key={item.href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 font-headline font-bold text-sm tracking-tight uppercase ${
                isActive
                  ? 'bg-[#cefc22] text-[#3b4a00]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-2 pb-2 space-y-0.5 border-t border-white/5 pt-2">
        <Link href={`/${locale}/dashboard`} onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 text-white/25 hover:text-white/60 hover:bg-white/5 transition-all font-headline font-bold text-xs tracking-tight uppercase">
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span>{t('sidebar.view_as_client')}</span>
        </Link>
        <Link href={`/${locale}/v4`} onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 text-white/25 hover:text-white/60 hover:bg-white/5 transition-all font-headline font-bold text-xs tracking-tight uppercase">
          <span className="material-symbols-outlined text-[20px]">public</span>
          <span>{t('sidebar.view_landing')}</span>
        </Link>
      </div>

      <div className="px-2 py-4 border-t border-white/5">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-white/25 hover:text-red-400 hover:bg-red-400/5 transition-all font-headline font-bold text-xs tracking-tight uppercase">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>{t('sidebar.sign_out')}</span>
        </button>
        <p className="px-4 mt-3 text-[10px] text-white/15 font-label tracking-widest uppercase">v2.0 · R3SET</p>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex w-72 flex-col flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-[#0e0e0e] border-b border-white/5">
          <span className="text-[#D1FF26] font-headline font-black text-lg uppercase italic tracking-tighter">R3SET Admin</span>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/60 hover:text-white p-1 transition-colors">
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
        {mobileOpen && <div className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />}
        <aside className={`fixed top-0 left-0 z-40 w-72 h-full transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
        </aside>
        <div className="h-14" />
      </div>
    </>
  )
}
