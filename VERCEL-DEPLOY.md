# 🚀 Deploy no Vercel - Guia Rápido

## ⚡ Configuração Rápida

O arquivo `vercel.json` já está configurado! Siga estes passos:

### 1. Conectar Repositório

1. Acesse: https://vercel.com
2. Clique em **"Add New Project"**
3. Conecte o repositório: `pdrooh/finora`
4. O Vercel detectará automaticamente o `vercel.json`

### 2. Configurações no Vercel

**IMPORTANTE**: Configure manualmente estas opções:

- **Root Directory**: `apps/web`
- **Framework Preset**: Next.js
- **Build Command**: (deixe vazio ou use do vercel.json)
- **Output Directory**: `apps/web/.next`
- **Install Command**: (deixe vazio ou use do vercel.json)

Ou simplesmente deixe o `vercel.json` fazer o trabalho!

### 3. Variáveis de Ambiente

Vá em **Settings → Environment Variables** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://hklzdawonkilsiedfqnm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

⚠️ Use a **ANON_KEY**, não a SERVICE_ROLE_KEY!

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar
3. Acesse a URL fornecida

---

## 🔧 Como o vercel.json Funciona

O `vercel.json` está configurado para:

1. **Install Command**: Instala dependências na raiz do monorepo
2. **Build Command**: 
   - Compila os packages compartilhados (`@finora/shared`, `@finora/supabase`)
   - Depois faz build do Next.js em `apps/web`
3. **Output Directory**: Aponta para `apps/web/.next`
4. **Root Directory**: Define `apps/web` como raiz do projeto

---

## 🐛 Troubleshooting

### Erro: "Module not found: @finora/shared"

**Solução**: O build dos packages não está rodando. Verifique:
- O script `build:packages` está no `package.json` da raiz
- O `vercel.json` está chamando `npm run build:packages` antes do build

### Erro: "Command exited with 1"

**Solução**: 
1. Verifique os logs do build no Vercel
2. Teste localmente: `npm install && npm run build:packages && cd apps/web && npm run build`
3. Se funcionar localmente, o problema pode ser nas variáveis de ambiente

### Erro: "Cannot find module"

**Solução**:
- Verifique se os packages foram compilados (devem ter pasta `dist/`)
- Verifique se o `package.json` dos packages aponta para `./dist/`

---

## ✅ Checklist

- [ ] `vercel.json` commitado no repositório
- [ ] Root Directory configurado como `apps/web`
- [ ] Variáveis de ambiente adicionadas
- [ ] Build local funciona (`npm run build:packages && cd apps/web && npm run build`)
- [ ] Deploy realizado
- [ ] Testes funcionais

---

## 📝 Notas

- O Vercel detecta automaticamente o `vercel.json` na raiz
- Se houver problemas, você pode sobrescrever as configurações no painel
- Sempre teste o build localmente antes de fazer deploy

