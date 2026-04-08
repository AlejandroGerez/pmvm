import { createClient } from '@/lib/supabase/server'
import ProgressClient from './ProgressClient'

export default async function ProgressPage({ params }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: records } = await supabase
    .from('progress')
    .select('*')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: true })

  return <ProgressClient locale={params.locale} records={records ?? []} userId={user!.id} />
}
