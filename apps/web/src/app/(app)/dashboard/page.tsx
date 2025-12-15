import { createSupabaseServerClient } from '@finora/supabase/server'
import { getMonthlySummary, getExpensesByCategory } from '@finora/supabase/queries'
import { getCurrentMonthKey } from '@finora/shared'
import { DashboardClient } from './dashboard-client'

async function getDashboardData(userId: string) {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const monthKey = getCurrentMonthKey()

  // Get last 6 months for trends
  const months = []
  const currentDate = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    months.push(`${year}-${month}`)
  }

  // Buscar profile e dados principais em paralelo
  const [summaryResult, expensesResult, incomesResult, debtsResult, profileResult, monthlyDataRaw] =
    await Promise.all([
      getMonthlySummary(supabase, userId, monthKey),
      getExpensesByCategory(supabase, userId, monthKey),
      supabase
        .from('incomes')
        .select('valor, tipo')
        .eq('user_id', userId)
        .eq('month_key', monthKey)
        .eq('ativo', true),
      supabase
        .from('debts')
        .select('valor_restante, parcela_mensal')
        .eq('user_id', userId)
        .eq('status', 'ATIVA'),
      supabase
        .from('profiles')
        .select('salario_fixo, frequencia_recebimento')
        .eq('user_id', userId)
        .single(),
      // Get monthly data for trends (otimizado: busca dados mensais em paralelo)
      Promise.all(
        months.map(async (mKey) => {
          const [incomes, expenses] = await Promise.all([
            supabase
              .from('incomes')
              .select('valor, tipo')
              .eq('user_id', userId)
              .eq('month_key', mKey)
              .eq('ativo', true),
            supabase
              .from('expenses')
              .select('valor')
              .eq('user_id', userId)
              .eq('month_key', mKey),
          ])

          return { mKey, incomes, expenses }
        })
      ),
    ])

  // Processar dados mensais usando o profile já buscado
  const profile = profileResult.data
  const monthlyDataResult = monthlyDataRaw.map(({ mKey, incomes, expenses }) => {
    let receitas_total =
      incomes.data?.reduce((sum, i) => sum + Number(i.valor), 0) || 0
    
    // Adicionar salário fixo se não estiver nas incomes (usar profile já buscado)
    if (profile?.salario_fixo && Number(profile.salario_fixo) > 0) {
      const salarioInIncomes = incomes.data?.some(
        (i) => i.tipo === 'FIXO' && Number(i.valor) === Number(profile.salario_fixo)
      )
      if (!salarioInIncomes) {
        receitas_total += Number(profile.salario_fixo)
      }
    }
    
    const despesas_total =
      expenses.data?.reduce((sum, e) => sum + Number(e.valor), 0) || 0

    return {
      month_key: mKey,
      receitas_total,
      despesas_total,
      saldo: receitas_total - despesas_total,
    }
  })

  const summary = summaryResult.data
  const expenses = expensesResult.data || []
  const incomes = incomesResult.data || []
  const debts = debtsResult.data || []
  // profile já foi definido acima na linha 68
  const monthlyData = monthlyDataResult || []

  // Calcular total de rendas (incomes + salário fixo do perfil se não estiver em incomes)
  let totalIncome = incomes.reduce((sum, i) => sum + Number(i.valor), 0)
  
  // Se há salário fixo no perfil, verificar se já está incluído nas incomes
  if (profile?.salario_fixo && Number(profile.salario_fixo) > 0) {
    const salarioInIncomes = incomes.some(
      (i) => i.tipo === 'FIXO' && Number(i.valor) === Number(profile.salario_fixo)
    )
    
    // Se o salário não está nas incomes, adicionar ao total
    if (!salarioInIncomes) {
      totalIncome += Number(profile.salario_fixo)
    }
  }
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.total_value), 0)
  const totalDebts = debts.reduce((sum, d) => sum + Number(d.valor_restante), 0)
  const monthlyDebtPayments = debts.reduce((sum, d) => sum + Number(d.parcela_mensal), 0)
  const balance = totalIncome - totalExpenses - monthlyDebtPayments

  return {
    summary,
    expenses,
    totalIncome,
    totalExpenses,
    totalDebts,
    monthlyDebtPayments,
    balance,
    monthlyData,
    categoryExpenses: expenses,
  }
}

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const data = await getDashboardData(user.id)

  return <DashboardClient data={data} />
}

