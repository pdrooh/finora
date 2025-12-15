// This file will be generated from Supabase CLI
// For now, using a basic structure
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          tipo_renda: string | null
          salario_fixo: number | null
          frequencia_recebimento: string | null
          dia_recebimento: number | null
          onboarding_completed: boolean
          onboarding_step: number
          financial_style: string | null
          objectives: string[] | null
          currency: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          icon: string | null
          color: string | null
          is_default: boolean
          is_income: boolean
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      incomes: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          tipo: string
          valor: number
          descricao: string
          recorrencia: string | null
          ativo: boolean
          data_inicio: string
          data_fim: string | null
          month_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['incomes']['Row'], 'id' | 'month_key' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['incomes']['Insert']>
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category_id: string
          tipo: string
          valor: number
          descricao: string
          data: string
          recorrencia: string | null
          is_recurring: boolean
          month_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'month_key' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
      expense_installments: {
        Row: {
          id: string
          expense_id: string
          user_id: string
          installment_number: number
          total_installments: number
          valor: number
          data_vencimento: string
          pago: boolean
          data_pagamento: string | null
          month_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['expense_installments']['Row'], 'id' | 'month_key' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['expense_installments']['Insert']>
      }
      debts: {
        Row: {
          id: string
          user_id: string
          nome: string
          tipo: string
          valor_total: number
          valor_restante: number
          taxa_juros: number
          tipo_juros: string | null
          parcela_mensal: number
          parcela_atual: number
          total_parcelas: number
          data_inicio: string
          data_vencimento: string | null
          status: string
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['debts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['debts']['Insert']>
      }
      goals: {
        Row: {
          id: string
          user_id: string
          titulo: string
          descricao: string | null
          valor_objetivo: number
          valor_atual: number
          prazo: string | null
          status: string
          aporte_mensal_sugerido: number | null
          categoria: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['goals']['Insert']>
      }
      assets: {
        Row: {
          id: string
          user_id: string
          nome: string
          tipo: string
          valor: number
          descricao: string | null
          data_aquisicao: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['assets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['assets']['Insert']>
      }
      budgets: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['budgets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['budgets']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          status: string
          plano: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          tipo: string
          titulo: string
          mensagem: string
          severity: string
          read: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>
      }
    }
    Views: {
      monthly_summary: {
        Row: {
          user_id: string
          month_key: string
          receitas_fixas: number
          receitas_extras: number
          receitas_total: number
        }
      }
      expenses_by_category_monthly: {
        Row: {
          user_id: string
          month_key: string
          category_id: string
          category_name: string
          total_expenses: number
          total_value: number
          avg_value: number
        }
      }
    }
  }
}
