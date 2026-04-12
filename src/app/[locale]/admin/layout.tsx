import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminPageTransition from '@/components/admin/AdminPageTransition'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${params.locale}/login`)

  // Use admin client to bypass RLS when reading the profile role
  const { data: profile } = await createAdminClient()
    .from('profiles')
    .select('role, full_name, avatar_url, locale')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect(`/${params.locale}/dashboard`)

  // Corregir locale de URL si no coincide con la preferencia del perfil
  const validLocales = ['es', 'en', 'pt']
  const profileLocale = profile?.locale && validLocales.includes(profile.locale) ? profile.locale : null
  if (profileLocale && profileLocale !== params.locale) {
    redirect(`/${profileLocale}/admin`)
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white font-body">
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar locale={params.locale} adminName={profile?.full_name ?? 'Admin'} adminAvatarUrl={profile?.avatar_url} />
        {/* pt-14 compensa el header fijo del mobile (h-14); en desktop no aplica */}
        <main className="flex-1 overflow-y-auto hide-scrollbar pt-14 lg:pt-0">
          <AdminPageTransition>
            {children}
          </AdminPageTransition>
        </main>
      </div>
    </div>
  )
}
