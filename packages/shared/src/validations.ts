import { z } from 'zod'

// Income validations
export const incomeSchema = z.object({
  tipo: z.enum(['FIXO', 'EXTRA']),
  valor: z.number().positive('Valor deve ser maior que zero'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  recorrencia: z.enum(['MENSAL', 'QUINZENAL', 'SEMANAL', 'ANUAL', 'DIARIA']).optional(),
  ativo: z.boolean().default(true),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category_id: z.string().uuid().optional(),
})

// Expense validations
export const expenseSchema = z.object({
  category_id: z.string().uuid('Categoria é obrigatória'),
  tipo: z.enum(['FIXA', 'VARIAVEL', 'PARCELADA']),
  valor: z.number().positive('Valor deve ser maior que zero'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  recorrencia: z.enum(['MENSAL', 'QUINZENAL', 'SEMANAL', 'ANUAL', 'DIARIA']).optional(),
  is_recurring: z.boolean().default(false),
})

// Parceled expense validation
export const parceledExpenseSchema = expenseSchema.extend({
  tipo: z.literal('PARCELADA'),
  total_installments: z.number().int().min(2).max(120),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

// Debt validations
export const debtSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['EMPRESTIMO', 'FINANCIAMENTO', 'CARTÃO', 'OUTRO']),
  valor_total: z.number().positive('Valor total deve ser maior que zero'),
  valor_restante: z.number().nonnegative('Valor restante não pode ser negativo'),
  taxa_juros: z.number().min(0).max(100).default(0),
  tipo_juros: z.enum(['SIMPLE', 'COMPOUND', 'FIXED']).optional(),
  parcela_mensal: z.number().positive('Parcela mensal deve ser maior que zero'),
  parcela_atual: z.number().int().positive().default(1),
  total_parcelas: z.number().int().positive('Total de parcelas deve ser maior que zero'),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  data_vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['ATIVA', 'QUITADA', 'VENCIDA']).default('ATIVA'),
  observacoes: z.string().optional(),
})

// Goal validations
export const goalSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  valor_objetivo: z.number().positive('Valor objetivo deve ser maior que zero'),
  valor_atual: z.number().nonnegative().default(0),
  prazo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['ATIVA', 'CONCLUIDA', 'CANCELADA', 'PAUSADA']).default('ATIVA'),
  aporte_mensal_sugerido: z.number().positive().optional(),
  categoria: z.string().optional(),
})

// Category validations
export const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  is_income: z.boolean().default(false),
  parent_id: z.string().uuid().optional(),
})

// Budget validations
export const budgetSchema = z.object({
  category_id: z.string().uuid('Categoria é obrigatória'),
  mes: z.number().int().min(1).max(12),
  ano: z.number().int().min(2000),
  valor_limite: z.number().positive('Limite deve ser maior que zero'),
  alerta_percentual: z.number().int().min(0).max(100).default(80),
})

// Asset validations
export const assetSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['CONTA_CORRENTE', 'POUPANCA', 'INVESTIMENTO', 'IMOVEL', 'VEICULO', 'OUTRO']),
  valor: z.number().nonnegative('Valor não pode ser negativo'),
  descricao: z.string().optional(),
  data_aquisicao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

// Profile validations
export const profileSchema = z.object({
  tipo_renda: z.enum(['CLT', 'PJ', 'MISTO']).optional(),
  salario_fixo: z.number().positive().optional(),
  frequencia_recebimento: z.string().optional(),
  dia_recebimento: z.number().int().min(1).max(31).optional(),
  financial_style: z.enum(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE']).optional(),
  objectives: z.array(z.string()).optional(),
  currency: z.string().default('BRL'),
  timezone: z.string().default('America/Sao_Paulo'),
})

// Onboarding step validations
export const onboardingStep1Schema = z.object({
  tipo_renda: z.enum(['CLT', 'PJ', 'MISTO']),
  salario_fixo: z.number().positive(),
  frequencia_recebimento: z.string(),
  dia_recebimento: z.number().int().min(1).max(31).optional(),
})

export const onboardingStep2Schema = z.object({
  rendas_extras: z.array(z.object({
    valor: z.number().positive(),
    frequencia: z.string(),
    descricao: z.string().min(1),
  })).optional(),
})

export const onboardingStep3Schema = z.object({
  dividas: z.array(debtSchema).optional(),
})

export const onboardingStep4Schema = z.object({
  objetivos: z.array(z.string()),
  financial_style: z.enum(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE']),
})

