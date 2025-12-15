import { Suspense } from 'react'
import { createSupabaseServerClient } from '@finora/supabase/server'
import { redirect } from 'next/navigation'
import { ExpensesClient } from './expenses-client'
import { DataTableSkeleton } from '@/components/data-table-skeleton'

async function getExpenses(userId: string) {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('expenses')
    .select('*, categories(name)')
    .eq('user_id', userId)
    .order('data', { ascending: false })

  if (error) {
    console.error('Error fetching expenses:', error)
    return []
  }

  return data || []
}

async function getCategories(userId: string) {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .or(`is_default.eq.true,user_id.eq.${userId}`)
    .eq('is_income', false)
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

async function ExpensesContent() {
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

  const [expenses, categories] = await Promise.all([
    getExpenses(user.id),
    getCategories(user.id),
  ])

  return <ExpensesClient initialExpenses={expenses} categories={categories} />
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ExpensesContent />
    </Suspense>
  )
}

