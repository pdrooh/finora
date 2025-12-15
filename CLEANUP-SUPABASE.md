# 🧹 Como Limpar o Supabase

## Problema
Se você está tendo dificuldades para limpar as tabelas antigas, siga estes passos:

## Solução 1: Script Normal (Tente Primeiro)

1. Acesse: https://supabase.com/dashboard/project/hklzdawonkilsiedfqnm
2. Vá em **SQL Editor**
3. Execute: `supabase/migrations/000_cleanup_old_tables.sql`
4. Verifique se funcionou

## Solução 2: Script Force (Se a Solução 1 Não Funcionar)

Se ainda houver erros, use o script mais agressivo:

1. Execute: `supabase/migrations/000_cleanup_force.sql`
2. Este script força a remoção de tudo

## Solução 3: Limpeza Manual (Último Recurso)

Se ainda não funcionar, execute no SQL Editor:

```sql
-- 1. Desabilitar RLS em todas as tabelas
ALTER TABLE installments DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE debts DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE incomes DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Deletar todas as tabelas (ordem correta)
DROP TABLE IF EXISTS installments CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS debts CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS incomes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Deletar funções
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 4. Deletar triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
```

## Verificação

Após executar qualquer script, verifique se as tabelas foram removidas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('installments', 'budgets', 'subscriptions', 'goals', 'debts', 'expenses', 'incomes', 'profiles');
```

Se retornar 0 linhas, as tabelas foram removidas com sucesso!

## Depois da Limpeza

1. Execute: `supabase/migrations/002_complete_schema.sql`
2. Isso criará o schema completo e otimizado

---

**Dica:** Se ainda houver problemas, pode ser que existam dados nas tabelas. Nesse caso, você pode primeiro deletar os dados e depois as tabelas:

```sql
DELETE FROM installments;
DELETE FROM budgets;
DELETE FROM subscriptions;
DELETE FROM goals;
DELETE FROM debts;
DELETE FROM expenses;
DELETE FROM incomes;
DELETE FROM profiles;
```

Depois execute os scripts de limpeza novamente.

