# 🔧 Correção do Onboarding - Salvamento no Supabase

## Problema Identificado
O onboarding não estava salvando corretamente na tabela `profiles` do Supabase.

## Correções Aplicadas

### 1. Política RLS Corrigida
A política de UPDATE estava faltando `WITH CHECK`, o que pode impedir atualizações.

**Migration criada:** `supabase/migrations/004_fix_profiles_rls_policy.sql`

### 2. Código do Onboarding Melhorado
- ✅ Logs detalhados para debug
- ✅ Verificação após atualização
- ✅ Melhor tratamento de erros
- ✅ Delay aumentado para garantir persistência

### 3. Estrutura da Tabela Verificada
A tabela `profiles` tem os campos corretos:
- `onboarding_completed BOOLEAN`
- `onboarding_step INTEGER`
- `financial_style TEXT`
- `objectives TEXT[]` (array)

## Como Aplicar a Correção

### Passo 1: Aplicar a Migration no Supabase

**Opção A - Via SQL Editor (Recomendado):**
1. Acesse: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Cole e execute:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate with WITH CHECK
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Opção B - Via Supabase CLI:**
```bash
supabase db push
```

### Passo 2: Testar o Onboarding

1. Reinicie o servidor:
   ```bash
   cd apps/web && npm run dev
   ```

2. Faça login e complete o onboarding

3. Abra o console do navegador (F12) para ver os logs:
   - "Completando onboarding..."
   - "Dados a serem atualizados:"
   - "Resultado da atualização:"
   - "Verificação após atualização:"

4. Verifique no Supabase se os dados foram salvos:
   - Vá em **Table Editor** → `profiles`
   - Verifique se `onboarding_completed = true`
   - Verifique se `onboarding_step = 4`
   - Verifique se `financial_style` e `objectives` foram salvos

## Verificação Manual no Supabase

Execute esta query no SQL Editor para verificar:

```sql
SELECT 
  user_id,
  onboarding_completed,
  onboarding_step,
  financial_style,
  objectives,
  updated_at
FROM profiles
WHERE user_id = 'SEU_USER_ID_AQUI';
```

## Se Ainda Não Funcionar

1. Verifique os logs no console do navegador
2. Verifique se há erros de RLS no Supabase Dashboard → Logs
3. Verifique se o `user_id` está correto
4. Verifique se a política RLS foi aplicada corretamente

## Estrutura Esperada da Tabela

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  tipo_renda TEXT,
  salario_fixo DECIMAL(12, 2),
  frequencia_recebimento TEXT,
  dia_recebimento INTEGER,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  financial_style TEXT,
  objectives TEXT[],
  currency TEXT DEFAULT 'BRL',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```
