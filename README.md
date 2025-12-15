# Finora - SaaS Financeiro Completo

Aplicativo de gestão financeira pessoal com **paridade total** entre Web e Mobile.

## 🏗️ Estrutura do Monorepo

```
finora-monorepo/
├── apps/
│   ├── web/          # Next.js App Router
│   └── mobile/       # Expo React Native
├── packages/
│   ├── shared/       # Tipos, validações, regras de negócio
│   ├── ui/           # Design system compartilhado
│   └── supabase/     # Cliente Supabase e helpers
└── supabase/
    └── migrations/   # SQL migrations
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm 9+
- Conta Supabase
- Conta Stripe (opcional, para assinaturas)

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.local` e configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Stripe (opcional)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PREMIUM=price_...
STRIPE_PRICE_ID_FAMILY=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Executar Migrations no Supabase

Execute o arquivo `supabase/migrations/002_complete_schema.sql` no SQL Editor do Supabase.

### 4. Rodar o Projeto

```bash
# Desenvolvimento (web + mobile)
npm run dev

# Apenas web
cd apps/web && npm run dev

# Apenas mobile
cd apps/mobile && npm start
```

## 📦 Packages

### `@finora/shared`

Tipos, validações Zod, constantes e utilitários compartilhados.

### `@finora/supabase`

Cliente Supabase tipado e helpers de queries.

### `@finora/ui`

Componentes de UI reutilizáveis (quando aplicável).

## 🔐 Segurança

- **RLS (Row Level Security)** ativado em todas as tabelas
- Policies garantem que usuários só acessam seus próprios dados
- Storage buckets privados com policies por usuário

## 📱 Features

### Paridade Total Web + Mobile

- ✅ Autenticação completa
- ✅ Onboarding financeiro
- ✅ CRUD de Receitas
- ✅ CRUD de Despesas (com parcelamento)
- ✅ Gestão de Dívidas
- ✅ Metas Financeiras
- ✅ Dashboard com gráficos
- ✅ Orçamento por categoria
- ✅ Exportação CSV/PDF
- ✅ Assinaturas Stripe
- ✅ Offline-first (mobile)

## 🛠️ Desenvolvimento

```bash
# Build todos os packages
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

## 📄 Licença

Proprietário - Todos os direitos reservados
