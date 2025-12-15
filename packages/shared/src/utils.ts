// Shared utility functions

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value)
}

export function formatDate(date: string | Date, locale = 'pt-BR'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatMonthYear(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return `${monthNames[parseInt(month) - 1]} ${year}`
}

export function getMonthKey(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getCurrentMonthKey(): string {
  return getMonthKey(new Date())
}

export function calculateDebtProgress(debt: {
  valor_total: number
  valor_restante: number
  parcela_atual: number
  total_parcelas: number
}): {
  progressPercent: number
  paidAmount: number
  remainingPayments: number
} {
  const paidAmount = debt.valor_total - debt.valor_restante
  const progressPercent = (paidAmount / debt.valor_total) * 100
  const remainingPayments = debt.total_parcelas - debt.parcela_atual

  return {
    progressPercent: Math.round(progressPercent * 100) / 100,
    paidAmount,
    remainingPayments,
  }
}

export function calculateGoalProgress(goal: {
  valor_objetivo: number
  valor_atual: number
}): {
  progressPercent: number
  remaining: number
  monthsToComplete?: number
  monthlyContribution?: number
} {
  const progressPercent = (goal.valor_atual / goal.valor_objetivo) * 100
  const remaining = goal.valor_objetivo - goal.valor_atual

  return {
    progressPercent: Math.min(Math.round(progressPercent * 100) / 100, 100),
    remaining,
  }
}

export function generateInstallmentDates(
  startDate: string,
  totalInstallments: number,
  frequency: 'MENSAL' | 'QUINZENAL' | 'SEMANAL' | 'ANUAL'
): string[] {
  const dates: string[] = []
  const start = new Date(startDate)

  for (let i = 0; i < totalInstallments; i++) {
    const date = new Date(start)
    
    switch (frequency) {
      case 'MENSAL':
        date.setMonth(date.getMonth() + i)
        break
      case 'QUINZENAL':
        date.setDate(date.getDate() + i * 15)
        break
      case 'SEMANAL':
        date.setDate(date.getDate() + i * 7)
        break
      case 'ANUAL':
        date.setFullYear(date.getFullYear() + i)
        break
    }

    dates.push(date.toISOString().split('T')[0])
  }

  return dates
}

export function calculateNetWorth(assets: Array<{ valor: number }>, debts: Array<{ valor_restante: number }>): number {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.valor, 0)
  const totalDebts = debts.reduce((sum, debt) => sum + debt.valor_restante, 0)
  return totalAssets - totalDebts
}

// Subscription feature access helper
// Note: This will be implemented when Stripe integration is complete
export function canAccessFeature(
  subscription: { plano: string; status: string } | null,
  feature: string
): boolean {
  if (!subscription || subscription.status !== 'ACTIVE') {
    return false
  }

  // Basic implementation - will be enhanced with Stripe integration
  return subscription.plano === 'PREMIUM' || subscription.plano === 'FAMILY'
}

