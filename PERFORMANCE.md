# ⚡ Otimizações de Performance - Finora

## 🔍 Problemas Identificados

1. **Queries múltiplas em cada página**
2. **Falta de cache agressivo**
3. **Dados sendo buscados mesmo quando não necessários**
4. **Sem paginação em listas grandes**

---

## ✅ Otimizações Já Implementadas

1. ✅ React.cache() no layout
2. ✅ Suspense boundaries
3. ✅ Loading states
4. ✅ Prefetch nos links
5. ✅ Queries otimizadas no dashboard

---

## 🚀 Otimizações Adicionais Recomendadas

### 1. Adicionar Revalidation no Next.js

Criar `apps/web/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Otimizações de cache
  },
  // Revalidar dados a cada 60 segundos
  revalidate: 60,
}

module.exports = nextConfig
```

### 2. Usar TanStack Query no Cliente

Para dados que mudam frequentemente, usar TanStack Query com cache:

```typescript
// apps/web/src/hooks/use-incomes.ts
import { useQuery } from '@tanstack/react-query'
import { createSupabaseClient } from '@/lib/supabase/client'

export function useIncomes() {
  return useQuery({
    queryKey: ['incomes'],
    queryFn: async () => {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      
      const { data } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', user.id)
        .order('data_inicio', { ascending: false })
      
      return data || []
    },
    staleTime: 30000, // 30 segundos
    cacheTime: 300000, // 5 minutos
  })
}
```

### 3. Paginação em Listas

Adicionar paginação nas listas grandes:

```typescript
// Exemplo para incomes
const [page, setPage] = useState(1)
const pageSize = 20

const { data } = await supabase
  .from('incomes')
  .select('*')
  .eq('user_id', userId)
  .order('data_inicio', { ascending: false })
  .range((page - 1) * pageSize, page * pageSize - 1)
```

### 4. Índices no Banco de Dados

Verificar se existem índices adequados:

```sql
-- Verificar índices existentes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Adicionar índices se necessário
CREATE INDEX IF NOT EXISTS idx_incomes_user_month 
ON incomes(user_id, month_key);

CREATE INDEX IF NOT EXISTS idx_expenses_user_month 
ON expenses(user_id, month_key);
```

### 5. Usar Views Materializadas

Para dados agregados pesados:

```sql
CREATE MATERIALIZED VIEW mv_monthly_summary AS
SELECT 
  user_id,
  month_key,
  SUM(CASE WHEN tipo = 'income' THEN valor ELSE 0 END) as total_income,
  SUM(CASE WHEN tipo = 'expense' THEN valor ELSE 0 END) as total_expense
FROM transactions
GROUP BY user_id, month_key;

-- Atualizar periodicamente
REFRESH MATERIALIZED VIEW mv_monthly_summary;
```

### 6. Streaming SSR

Usar streaming para carregar dados progressivamente:

```typescript
// apps/web/src/app/(app)/dashboard/page.tsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardSummary />
      </Suspense>
      <Suspense fallback={<ChartsSkeleton />}>
        <DashboardCharts />
      </Suspense>
    </div>
  )
}
```

### 7. Otimizar Imagens e Assets

- Usar Next.js Image component
- Lazy load de componentes pesados
- Code splitting automático

### 8. Service Worker para Cache Offline

```typescript
// apps/web/public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request)
      })
    )
  }
})
```

---

## 📊 Métricas para Monitorar

1. **Time to First Byte (TTFB)**: < 200ms
2. **First Contentful Paint (FCP)**: < 1.8s
3. **Largest Contentful Paint (LCP)**: < 2.5s
4. **Time to Interactive (TTI)**: < 3.8s

Use Lighthouse ou WebPageTest para medir.

---

## 🔧 Implementação Rápida

### Passo 1: Adicionar Revalidation

```bash
# Criar next.config.js se não existir
touch apps/web/next.config.js
```

### Passo 2: Verificar Índices

Execute no Supabase SQL Editor:

```sql
-- Ver índices existentes
SELECT * FROM pg_indexes WHERE schemaname = 'public';
```

### Passo 3: Adicionar Paginação

Implementar paginação nas listas principais (incomes, expenses, etc).

---

## 🎯 Prioridades

**Alta Prioridade:**
1. ✅ Adicionar índices no banco
2. ✅ Implementar paginação
3. ✅ Usar TanStack Query para cache

**Média Prioridade:**
4. ✅ Views materializadas para agregados
5. ✅ Streaming SSR
6. ✅ Service Worker

**Baixa Prioridade:**
7. ✅ Otimizações de bundle
8. ✅ Lazy loading avançado

---

## 📝 Notas

- Teste cada otimização individualmente
- Meça antes e depois
- Não otimize prematuramente
- Foque nos gargalos reais

