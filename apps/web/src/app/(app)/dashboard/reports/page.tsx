import { createSupabaseServerClient } from '@finora/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsClient } from './reports-client'

async function getReportData(userId: string, monthKey: string) {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [incomes, expenses, debts, goals, profile] = await Promise.all([
    supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .eq('month_key', monthKey),
    supabase
      .from('expenses')
      .select('*, categories(name)')
      .eq('user_id', userId)
      .eq('month_key', monthKey),
    supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ATIVA'),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ATIVA'),
    supabase
      .from('profiles')
      .select('salario_fixo')
      .eq('user_id', userId)
      .single(),
  ])

  return {
    incomes: incomes.data || [],
    expenses: expenses.data || [],
    debts: debts.data || [],
    goals: goals.data || [],
    profile: profile.data,
  }
}

export default async function ReportsPage() {
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

  const monthKey = new Date().toISOString().slice(0, 7)
  const data = await getReportData(user.id, monthKey)

  return <ReportsClient initialData={data} />
}

