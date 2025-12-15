-- ============================================
-- PERFORMANCE INDEXES
-- Índices adicionais para melhorar performance de queries
-- ============================================

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_incomes_user_month_active 
ON incomes(user_id, month_key, ativo) 
WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_incomes_user_tipo 
ON incomes(user_id, tipo);

CREATE INDEX IF NOT EXISTS idx_expenses_user_month 
ON expenses(user_id, month_key);

CREATE INDEX IF NOT EXISTS idx_expenses_user_category 
ON expenses(user_id, category_id);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date 
ON expenses(user_id, data DESC);

CREATE INDEX IF NOT EXISTS idx_debts_user_status 
ON debts(user_id, status) 
WHERE status = 'ATIVA';

CREATE INDEX IF NOT EXISTS idx_goals_user_status 
ON goals(user_id, status) 
WHERE status = 'ATIVA';

-- Índices para busca de texto (usando pg_trgm)
CREATE INDEX IF NOT EXISTS idx_incomes_descricao_search 
ON incomes USING gin(descricao gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_expenses_descricao_search 
ON expenses USING gin(descricao gin_trgm_ops);

-- Índices para ordenação
CREATE INDEX IF NOT EXISTS idx_incomes_data_inicio_desc 
ON incomes(user_id, data_inicio DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_data_desc 
ON expenses(user_id, data DESC);

CREATE INDEX IF NOT EXISTS idx_debts_data_inicio_desc 
ON debts(user_id, data_inicio DESC);

CREATE INDEX IF NOT EXISTS idx_goals_created_at_desc 
ON goals(user_id, created_at DESC);

-- Índices para joins com categories
CREATE INDEX IF NOT EXISTS idx_expenses_category_id 
ON expenses(category_id) 
WHERE category_id IS NOT NULL;

-- Índices para expense_installments
CREATE INDEX IF NOT EXISTS idx_expense_installments_expense_id 
ON expense_installments(expense_id);

CREATE INDEX IF NOT EXISTS idx_expense_installments_user_month 
ON expense_installments(user_id, month_key);

-- Análise de tabelas para otimizar queries
ANALYZE profiles;
ANALYZE incomes;
ANALYZE expenses;
ANALYZE expense_installments;
ANALYZE debts;
ANALYZE goals;
ANALYZE categories;

