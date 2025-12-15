// Shared constants

export const DEFAULT_CATEGORIES = {
  EXPENSES: [
    { name: 'Alimentação', icon: '🍔', color: '#FF6B6B' },
    { name: 'Transporte', icon: '🚗', color: '#4ECDC4' },
    { name: 'Moradia', icon: '🏠', color: '#45B7D1' },
    { name: 'Saúde', icon: '🏥', color: '#96CEB4' },
    { name: 'Educação', icon: '📚', color: '#FFEAA7' },
    { name: 'Lazer', icon: '🎮', color: '#DDA15E' },
    { name: 'Outros', icon: '📦', color: '#636E72' },
  ],
  INCOMES: [
    { name: 'Salário', icon: '💰', color: '#6C5CE7' },
    { name: 'Freelance', icon: '💼', color: '#A29BFE' },
    { name: 'Investimentos', icon: '📈', color: '#00B894' },
  ],
}

export const RECURRENCE_OPTIONS = [
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'QUINZENAL', label: 'Quinzenal' },
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'ANUAL', label: 'Anual' },
  { value: 'DIARIA', label: 'Diária' },
] as const

export const INCOME_TYPES = [
  { value: 'FIXO', label: 'Fixa (Recorrente)' },
  { value: 'EXTRA', label: 'Extra (Eventual)' },
] as const

export const EXPENSE_TYPES = [
  { value: 'FIXA', label: 'Fixa' },
  { value: 'VARIAVEL', label: 'Variável' },
  { value: 'PARCELADA', label: 'Parcelada' },
] as const

export const DEBT_TYPES = [
  { value: 'EMPRESTIMO', label: 'Empréstimo' },
  { value: 'FINANCIAMENTO', label: 'Financiamento' },
  { value: 'CARTÃO', label: 'Cartão de Crédito' },
  { value: 'OUTRO', label: 'Outro' },
] as const

export const FINANCIAL_STYLES = [
  { value: 'CONSERVATIVE', label: 'Conservador' },
  { value: 'MODERATE', label: 'Moderado' },
  { value: 'AGGRESSIVE', label: 'Agressivo' },
] as const

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Gratuito',
    limits: {
      transactionsPerMonth: 50,
      hasAdvancedReports: false,
      hasPDFExport: false,
      hasAI: false,
      hasMultipleProfiles: false,
    },
  },
  PREMIUM: {
    name: 'Premium',
    limits: {
      transactionsPerMonth: -1, // Unlimited
      hasAdvancedReports: true,
      hasPDFExport: true,
      hasAI: true,
      hasMultipleProfiles: false,
    },
  },
  FAMILY: {
    name: 'Família',
    limits: {
      transactionsPerMonth: -1,
      hasAdvancedReports: true,
      hasPDFExport: true,
      hasAI: true,
      hasMultipleProfiles: true,
    },
  },
} as const

export const FEATURE_FLAGS = {
  ADVANCED_REPORTS: 'hasAdvancedReports',
  PDF_EXPORT: 'hasPDFExport',
  AI_INSIGHTS: 'hasAI',
  MULTIPLE_PROFILES: 'hasMultipleProfiles',
} as const

