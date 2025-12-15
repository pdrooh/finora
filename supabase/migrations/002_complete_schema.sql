-- ============================================
-- COMPLETE FINANCIAL SAAS SCHEMA
-- Performance-optimized with views, indexes, and RLS
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- PROFILES TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_renda TEXT CHECK (tipo_renda IN ('CLT', 'PJ', 'MISTO')),
  salario_fixo DECIMAL(12, 2),
  frequencia_recebimento TEXT,
  dia_recebimento INTEGER CHECK (dia_recebimento BETWEEN 1 AND 31),
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  financial_style TEXT CHECK (financial_style IN ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE')),
  objectives TEXT[],
  currency TEXT DEFAULT 'BRL',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_onboarding ON profiles(user_id, onboarding_completed);

-- ============================================
-- CATEGORIES TABLE (Default + Custom)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT false,
  is_income BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_category UNIQUE (user_id, name)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_default ON categories(is_default) WHERE is_default = true;

-- Insert default categories
INSERT INTO categories (id, name, icon, color, is_default, is_income) VALUES
  (uuid_generate_v4(), 'Alimentação', '🍔', '#FF6B6B', true, false),
  (uuid_generate_v4(), 'Transporte', '🚗', '#4ECDC4', true, false),
  (uuid_generate_v4(), 'Moradia', '🏠', '#45B7D1', true, false),
  (uuid_generate_v4(), 'Saúde', '🏥', '#96CEB4', true, false),
  (uuid_generate_v4(), 'Educação', '📚', '#FFEAA7', true, false),
  (uuid_generate_v4(), 'Lazer', '🎮', '#DDA15E', true, false),
  (uuid_generate_v4(), 'Salário', '💰', '#6C5CE7', true, true),
  (uuid_generate_v4(), 'Freelance', '💼', '#A29BFE', true, true),
  (uuid_generate_v4(), 'Investimentos', '📈', '#00B894', true, true),
  (uuid_generate_v4(), 'Outros', '📦', '#636E72', true, false)
ON CONFLICT DO NOTHING;

-- ============================================
-- INCOMES TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS incomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('FIXO', 'EXTRA')),
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  descricao TEXT NOT NULL,
  recorrencia TEXT CHECK (recorrencia IN ('MENSAL', 'QUINZENAL', 'SEMANAL', 'ANUAL', 'DIARIA')),
  ativo BOOLEAN DEFAULT true,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  month_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incomes_user_id ON incomes(user_id);
CREATE INDEX idx_incomes_user_date ON incomes(user_id, data_inicio DESC);
CREATE INDEX idx_incomes_month_key ON incomes(user_id, month_key);
CREATE INDEX idx_incomes_category ON incomes(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_incomes_active ON incomes(user_id, ativo) WHERE ativo = true;

-- ============================================
-- EXPENSES TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  tipo TEXT NOT NULL CHECK (tipo IN ('FIXA', 'VARIAVEL', 'PARCELADA')),
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  descricao TEXT NOT NULL,
  data DATE NOT NULL,
  recorrencia TEXT CHECK (recorrencia IN ('MENSAL', 'QUINZENAL', 'SEMANAL', 'ANUAL', 'DIARIA')),
  is_recurring BOOLEAN DEFAULT false,
  month_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, data DESC);
CREATE INDEX idx_expenses_month_key ON expenses(user_id, month_key);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_type ON expenses(user_id, tipo);

-- ============================================
-- EXPENSE INSTALLMENTS TABLE (Parcelas)
-- ============================================
CREATE TABLE IF NOT EXISTS expense_installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL CHECK (installment_number > 0),
  total_installments INTEGER NOT NULL CHECK (total_installments > 0),
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  data_vencimento DATE NOT NULL,
  pago BOOLEAN DEFAULT false,
  data_pagamento DATE,
  month_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_installment UNIQUE (expense_id, installment_number)
);

CREATE INDEX idx_installments_expense ON expense_installments(expense_id);
CREATE INDEX idx_installments_user ON expense_installments(user_id, data_vencimento);
CREATE INDEX idx_installments_month ON expense_installments(user_id, month_key);
CREATE INDEX idx_installments_paid ON expense_installments(user_id, pago) WHERE pago = false;

-- ============================================
-- DEBTS TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('EMPRESTIMO', 'FINANCIAMENTO', 'CARTÃO', 'OUTRO')),
  valor_total DECIMAL(12, 2) NOT NULL CHECK (valor_total > 0),
  valor_restante DECIMAL(12, 2) NOT NULL CHECK (valor_restante >= 0),
  taxa_juros DECIMAL(5, 4) DEFAULT 0,
  tipo_juros TEXT CHECK (tipo_juros IN ('SIMPLE', 'COMPOUND', 'FIXED')),
  parcela_mensal DECIMAL(12, 2) NOT NULL CHECK (parcela_mensal > 0),
  parcela_atual INTEGER DEFAULT 1,
  total_parcelas INTEGER NOT NULL CHECK (total_parcelas > 0),
  data_inicio DATE NOT NULL,
  data_vencimento DATE,
  status TEXT DEFAULT 'ATIVA' CHECK (status IN ('ATIVA', 'QUITADA', 'VENCIDA')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_debts_status ON debts(user_id, status);
CREATE INDEX idx_debts_active ON debts(user_id, status) WHERE status = 'ATIVA';

-- ============================================
-- GOALS TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_objetivo DECIMAL(12, 2) NOT NULL CHECK (valor_objetivo > 0),
  valor_atual DECIMAL(12, 2) DEFAULT 0 CHECK (valor_atual >= 0),
  prazo DATE,
  status TEXT DEFAULT 'ATIVA' CHECK (status IN ('ATIVA', 'CONCLUIDA', 'CANCELADA', 'PAUSADA')),
  aporte_mensal_sugerido DECIMAL(12, 2),
  categoria TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(user_id, status);
CREATE INDEX idx_goals_active ON goals(user_id, status) WHERE status = 'ATIVA';

-- ============================================
-- ASSETS TABLE (Patrimônio)
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('CONTA_CORRENTE', 'POUPANCA', 'INVESTIMENTO', 'IMOVEL', 'VEICULO', 'OUTRO')),
  valor DECIMAL(12, 2) NOT NULL CHECK (valor >= 0),
  descricao TEXT,
  data_aquisicao DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_type ON assets(user_id, tipo);

-- ============================================
-- BUDGETS TABLE (Orçamento por Categoria)
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL CHECK (ano > 2000),
  valor_limite DECIMAL(12, 2) NOT NULL CHECK (valor_limite > 0),
  valor_gasto DECIMAL(12, 2) DEFAULT 0 CHECK (valor_gasto >= 0),
  alerta_percentual INTEGER DEFAULT 80 CHECK (alerta_percentual BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_budget UNIQUE (user_id, category_id, mes, ano)
);

CREATE INDEX idx_budgets_user_month ON budgets(user_id, ano, mes);
CREATE INDEX idx_budgets_category ON budgets(category_id);

-- ============================================
-- SUBSCRIPTIONS TABLE (Stripe Integration)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'CANCELED', 'PAST_DUE', 'UNPAID', 'TRIALING', 'INCOMPLETE')),
  plano TEXT NOT NULL CHECK (plano IN ('FREE', 'PREMIUM', 'FAMILY')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- ATTACHMENTS TABLE (Comprovantes)
-- ============================================
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  income_id UUID REFERENCES incomes(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  storage_bucket TEXT DEFAULT 'receipts',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_user_id ON attachments(user_id);
CREATE INDEX idx_attachments_expense ON attachments(expense_id) WHERE expense_id IS NOT NULL;
CREATE INDEX idx_attachments_income ON attachments(income_id) WHERE income_id IS NOT NULL;

-- ============================================
-- ALERTS TABLE (Alertas e Notificações)
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('BUDGET_EXCEEDED', 'CATEGORY_SPIKE', 'NEGATIVE_BALANCE', 'DEBT_DUE', 'GOAL_MILESTONE')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  severity TEXT DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id, created_at DESC);
CREATE INDEX idx_alerts_unread ON alerts(user_id, read) WHERE read = false;

-- ============================================
-- MONTHLY SUMMARY VIEW (Performance)
-- ============================================
CREATE OR REPLACE VIEW monthly_summary AS
SELECT
  user_id,
  month_key,
  COALESCE(SUM(CASE WHEN tipo = 'FIXO' AND ativo = true THEN valor ELSE 0 END), 0) as receitas_fixas,
  COALESCE(SUM(CASE WHEN tipo = 'EXTRA' THEN valor ELSE 0 END), 0) as receitas_extras,
  COALESCE(SUM(valor), 0) as receitas_total
FROM incomes
GROUP BY user_id, month_key
UNION ALL
SELECT
  user_id,
  month_key,
  0 as receitas_fixas,
  0 as receitas_extras,
  0 as receitas_total
FROM expenses
GROUP BY user_id, month_key;

-- Materialized view for better performance
CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_summary_mv AS
SELECT
  user_id,
  month_key,
  COALESCE(SUM(CASE WHEN tipo = 'FIXO' AND ativo = true THEN valor ELSE 0 END), 0) as receitas_fixas,
  COALESCE(SUM(CASE WHEN tipo = 'EXTRA' THEN valor ELSE 0 END), 0) as receitas_extras,
  COALESCE(SUM(valor), 0) as receitas_total,
  NOW() as refreshed_at
FROM incomes
GROUP BY user_id, month_key;

CREATE UNIQUE INDEX idx_monthly_summary_mv ON monthly_summary_mv(user_id, month_key);

-- ============================================
-- EXPENSES BY CATEGORY VIEW
-- ============================================
CREATE OR REPLACE VIEW expenses_by_category_monthly AS
SELECT
  e.user_id,
  e.month_key,
  e.category_id,
  c.name as category_name,
  COUNT(*) as total_expenses,
  SUM(e.valor) as total_value,
  AVG(e.valor) as avg_value
FROM expenses e
JOIN categories c ON e.category_id = c.id
GROUP BY e.user_id, e.month_key, e.category_id, c.name;

-- ============================================
-- FUNCTIONS FOR MONTH_KEY AND UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION calculate_month_key(date_value DATE)
RETURNS TEXT AS $$
BEGIN
  RETURN TO_CHAR(date_value, 'YYYY-MM');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION update_income_month_key()
RETURNS TRIGGER AS $$
BEGIN
  NEW.month_key = calculate_month_key(NEW.data_inicio);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_expense_month_key()
RETURNS TRIGGER AS $$
BEGIN
  NEW.month_key = calculate_month_key(NEW.data);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_installment_month_key()
RETURNS TRIGGER AS $$
BEGIN
  NEW.month_key = calculate_month_key(NEW.data_vencimento);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for month_key calculation
CREATE TRIGGER calculate_income_month_key
  BEFORE INSERT OR UPDATE ON incomes
  FOR EACH ROW
  WHEN (NEW.data_inicio IS NOT NULL)
  EXECUTE FUNCTION update_income_month_key();

CREATE TRIGGER calculate_expense_month_key
  BEFORE INSERT OR UPDATE ON expenses
  FOR EACH ROW
  WHEN (NEW.data IS NOT NULL)
  EXECUTE FUNCTION update_expense_month_key();

CREATE TRIGGER calculate_installment_month_key
  BEFORE INSERT OR UPDATE ON expense_installments
  FOR EACH ROW
  WHEN (NEW.data_vencimento IS NOT NULL)
  EXECUTE FUNCTION update_installment_month_key();

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON incomes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON expense_installments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION TO UPDATE BUDGET SPENT
-- ============================================
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
DECLARE
  expense_month_key TEXT;
  budget_mes INTEGER;
  budget_ano INTEGER;
BEGIN
  -- Calculate month_key from expense date
  expense_month_key := calculate_month_key(COALESCE(NEW.data, OLD.data));
  
  -- Extract month and year from month_key
  budget_ano := CAST(SPLIT_PART(expense_month_key, '-', 1) AS INTEGER);
  budget_mes := CAST(SPLIT_PART(expense_month_key, '-', 2) AS INTEGER);
  
  -- Update budget spent
  UPDATE budgets
  SET valor_gasto = (
    SELECT COALESCE(SUM(valor), 0)
    FROM expenses
    WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
      AND user_id = COALESCE(NEW.user_id, OLD.user_id)
      AND month_key = expense_month_key
  )
  WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
    AND user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND mes = budget_mes
    AND ano = budget_ano;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_budget_on_expense
  AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_spent();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view categories" ON categories;
DROP POLICY IF EXISTS "Users can manage own categories" ON categories;

CREATE POLICY "Users can view categories"
  ON categories FOR SELECT
  USING (is_default = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);

-- Incomes
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own incomes" ON incomes;

CREATE POLICY "Users can manage own incomes"
  ON incomes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own expenses" ON expenses;

CREATE POLICY "Users can manage own expenses"
  ON expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Expense Installments
ALTER TABLE expense_installments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own installments"
  ON expense_installments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Debts
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own debts" ON debts;

CREATE POLICY "Users can manage own debts"
  ON debts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own goals" ON goals;

CREATE POLICY "Users can manage own goals"
  ON goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own assets"
  ON assets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Budgets
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own budgets"
  ON budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Attachments
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own attachments"
  ON attachments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own alerts"
  ON alerts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS AND POLICIES
-- ============================================
-- Note: These need to be run in Supabase Dashboard or via API
-- Creating receipts bucket policy SQL for reference

-- Bucket: receipts
-- Policy: Users can upload own files
-- Policy: Users can view own files
-- Policy: Users can delete own files

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE profiles IS 'User financial profiles with onboarding state';
COMMENT ON TABLE categories IS 'Expense/income categories (default + custom)';
COMMENT ON TABLE incomes IS 'User income entries (fixed and extra)';
COMMENT ON TABLE expenses IS 'User expense entries';
COMMENT ON TABLE expense_installments IS 'Generated installments for parceled expenses';
COMMENT ON TABLE debts IS 'Loans, financing, and debts';
COMMENT ON TABLE goals IS 'Financial goals and objectives';
COMMENT ON TABLE assets IS 'User assets for net worth calculation';
COMMENT ON TABLE budgets IS 'Monthly budgets per category';
COMMENT ON TABLE subscriptions IS 'Stripe subscription management';
COMMENT ON TABLE attachments IS 'Receipts and document attachments';
COMMENT ON TABLE alerts IS 'User alerts and notifications';

