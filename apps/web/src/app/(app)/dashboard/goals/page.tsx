import { Suspense } from 'react'
import { createSupabaseServerClient } from '@finora/supabase/server'
import { redirect } from 'next/navigation'
import { GoalsClient } from './goals-client'
import { DataTableSkeleton } from '@/components/data-table-skeleton'

async function getGoals(userId: string) {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching goals:', error)
    return []
  }

  return data || []
}

async function GoalsContent() {
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

  const goals = await getGoals(user.id)

  return <GoalsClient initialGoals={goals} />
}

export default function GoalsPage() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <GoalsContent />
    </Suspense>
  )
}

