// Domain types shared between web and mobile

export type IncomeType = 'FIXO' | 'EXTRA'
export type ExpenseType = 'FIXA' | 'VARIAVEL' | 'PARCELADA'
export type RecurrenceType = 'MENSAL' | 'QUINZENAL' | 'SEMANAL' | 'ANUAL' | 'DIARIA'
export type DebtType = 'EMPRESTIMO' | 'FINANCIAMENTO' | 'CARTÃO' | 'OUTRO'
export type DebtStatus = 'ATIVA' | 'QUITADA' | 'VENCIDA'
export type GoalStatus = 'ATIVA' | 'CONCLUIDA' | 'CANCELADA' | 'PAUSADA'
export type SubscriptionPlan = 'FREE' | 'PREMIUM' | 'FAMILY'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIALING' | 'INCOMPLETE'
export type AlertType = 'BUDGET_EXCEEDED' | 'CATEGORY_SPIKE' | 'NEGATIVE_BALANCE' | 'DEBT_DUE' | 'GOAL_MILESTONE'
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL'
export type IncomeSource = 'CLT' | 'PJ' | 'MISTO'
export type FinancialStyle = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'

export interface Income {
  id: string
  user_id: string
  category_id?: string
  tipo: IncomeType
  valor: number
  descricao: string
  recorrencia?: RecurrenceType
  ativo: boolean
  data_inicio: string
  data_fim?: string
  month_key?: string
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  user_id: string
  category_id: string
  tipo: ExpenseType
  valor: number
  descricao: string
  data: string
  recorrencia?: RecurrenceType
  is_recurring: boolean
  month_key?: string
  created_at: string
  updated_at: string
}

export interface ExpenseInstallment {
  id: string
  expense_id: string
  user_id: string
  installment_number: number
  total_installments: number
  valor: number
  data_vencimento: string
  pago: boolean
  data_pagamento?: string
  month_key?: string
  created_at: string
  updated_at: string
}

export interface Debt {
  id: string
  user_id: string
  nome: string
  tipo: DebtType
  valor_total: number
  valor_restante: number
  taxa_juros: number
  tipo_juros?: 'SIMPLE' | 'COMPOUND' | 'FIXED'
  parcela_mensal: number
  parcela_atual: number
  total_parcelas: number
  data_inicio: string
  data_vencimento?: string
  status: DebtStatus
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  titulo: string
  descricao?: string
  valor_objetivo: number
  valor_atual: number
  prazo?: string
  status: GoalStatus
  aporte_mensal_sugerido?: number
  categoria?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id?: string
  name: string
  icon?: string
  color?: string
  is_default: boolean
  is_income: boolean
  parent_id?: string
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  mes: number
  ano: number
  valor_limite: number
  valor_gasto: number
  alerta_percentual: number
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  user_id: string
  nome: string
  tipo: 'CONTA_CORRENTE' | 'POUPANCA' | 'INVESTIMENTO' | 'IMOVEL' | 'VEICULO' | 'OUTRO'
  valor: number
  descricao?: string
  data_aquisicao?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  stripe_price_id?: string
  status: SubscriptionStatus
  plano: SubscriptionPlan
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end: boolean
  canceled_at?: string
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  user_id: string
  tipo: AlertType
  titulo: string
  mensagem: string
  severity: AlertSeverity
  read: boolean
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  tipo_renda?: IncomeSource
  salario_fixo?: number
  frequencia_recebimento?: string
  dia_recebimento?: number
  onboarding_completed: boolean
  onboarding_step: number
  financial_style?: FinancialStyle
  objectives?: string[]
  currency: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface MonthlySummary {
  user_id: string
  month_key: string
  receitas_fixas: number
  receitas_extras: number
  receitas_total: number
  despesas_total: number
  saldo: number
}

export interface ExpensesByCategory {
  user_id: string
  month_key: string
  category_id: string
  category_name: string
  total_expenses: number
  total_value: number
  avg_value: number
}

