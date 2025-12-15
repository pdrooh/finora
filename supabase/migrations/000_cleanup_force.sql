-- ============================================
-- FORCE CLEANUP: Remove ALL old tables (aggressive)
-- Use this if 000_cleanup_old_tables.sql doesn't work
-- ============================================

-- Drop everything in correct order
DROP TABLE IF EXISTS installments CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS debts CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS incomes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop all related objects
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_budget_spent() CASCADE;

DROP TRIGGER IF EXISTS update_installments_updated_at ON installments;
DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
DROP TRIGGER IF EXISTS update_debts_updated_at ON debts;
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
DROP TRIGGER IF EXISTS update_incomes_updated_at ON incomes;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_budget_on_expense ON expenses;

DROP MATERIALIZED VIEW IF EXISTS monthly_summary_mv CASCADE;
DROP VIEW IF EXISTS monthly_summary CASCADE;
DROP VIEW IF EXISTS expenses_by_category_monthly CASCADE;

-- Drop all policies (in case they exist)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public' 
              AND tablename IN ('installments', 'budgets', 'subscriptions', 'goals', 'debts', 'expenses', 'incomes', 'profiles')) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop all indexes
DROP INDEX IF EXISTS idx_incomes_user_id;
DROP INDEX IF EXISTS idx_incomes_data_inicio;
DROP INDEX IF EXISTS idx_expenses_user_id;
DROP INDEX IF EXISTS idx_expenses_data;
DROP INDEX IF EXISTS idx_expenses_categoria;
DROP INDEX IF EXISTS idx_debts_user_id;
DROP INDEX IF EXISTS idx_goals_user_id;
DROP INDEX IF EXISTS idx_budgets_user_id;
DROP INDEX IF EXISTS idx_budgets_mes_ano;
DROP INDEX IF EXISTS idx_profiles_user_id;
DROP INDEX IF EXISTS idx_profiles_onboarding;

-- Final verification message
DO $$
BEGIN
  RAISE NOTICE 'Force cleanup completed. All old tables should be removed.';
END $$;

