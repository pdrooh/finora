import { Suspense } from 'react'
import { createSupabaseServerClient } from '@finora/supabase/server'
import { redirect } from 'next/navigation'
import { IncomesClient } from './incomes-client'
import { DataTableSkeleton } from '@/components/data-table-skeleton'

async function getIncomes(userId: string) {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .eq('user_id', userId)
    .order('data_inicio', { ascending: false })

  if (error) {
    console.error('Error fetching incomes:', error)
    return []
  }

  return data || []
}

async function IncomesContent() {
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

  const [incomes, profile] = await Promise.all([
    getIncomes(user.id),
    supabase
      .from('profiles')
      .select('salario_fixo, frequencia_recebimento')
      .eq('user_id', user.id)
      .single(),
  ])

  return <IncomesClient initialIncomes={incomes} profile={profile.data} />
}

export default function IncomesPage() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <IncomesContent />
    </Suspense>
  )
}

