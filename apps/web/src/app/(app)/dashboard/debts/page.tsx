import { Suspense } from 'react'
import { createSupabaseServerClient } from '@finora/supabase/server'
import { redirect } from 'next/navigation'
import { DebtsClient } from './debts-client'
import { DataTableSkeleton } from '@/components/data-table-skeleton'

async function getDebts(userId: string) {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('data_inicio', { ascending: false })

  if (error) {
    console.error('Error fetching debts:', error)
    return []
  }

  return data || []
}

async function DebtsContent() {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const debts = await getDebts(user.id)

  return <DebtsClient initialDebts={debts} />
}

export default function DebtsPage() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <DebtsContent />
    </Suspense>
  )
}

