# 🚀 Guia de Deploy - Finora

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com) (recomendado) ou alternativa
- Projeto Supabase configurado e rodando
- Repositório Git (GitHub, GitLab, etc)
- Domínio (opcional, mas recomendado)

---

## 🎯 Opção 1: Vercel (Recomendado para Next.js)

### Passo 1: Preparar o Projeto

1. **Garantir que está tudo commitado:**
   ```bash
   git add .
   git commit -m "Preparar para deploy"
   git push origin main
   ```

2. **Verificar estrutura do monorepo:**
   - O projeto deve ter `apps/web` como aplicação Next.js
   - Verificar se `package.json` na raiz tem scripts corretos

### Passo 2: Criar Projeto no Vercel

1. Acesse: https://vercel.com
2. Clique em **"Add New Project"**
3. Conecte seu repositório Git
4. **IMPORTANTE**: O arquivo `vercel.json` já está configurado! Apenas verifique:
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `apps/web` (já configurado no vercel.json)
   - **Build Command**: Será usado do `vercel.json` automaticamente
   - **Output Directory**: `apps/web/.next` (já configurado)
   - **Install Command**: `npm install` (já configurado)

   ⚠️ **Se precisar configurar manualmente:**
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm install && npm run build:packages && cd apps/web && npm run build`
   - **Output Directory**: `apps/web/.next`
   - **Install Command**: `npm install`

### Passo 3: Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings → Environment Variables** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://hklzdawonkilsiedfqnm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

⚠️ **IMPORTANTE**: Use a `ANON_KEY` (não a `SERVICE_ROLE_KEY`) no frontend!

### Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar
3. Acesse a URL fornecida (ex: `seu-projeto.vercel.app`)

### Passo 5: Configurar Domínio (Opcional)

1. Vá em **Settings → Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções do Vercel

---

## 🎯 Opção 2: Railway

### Passo 1: Criar Conta

1. Acesse: https://railway.app
2. Crie uma conta (pode usar GitHub)

### Passo 2: Criar Novo Projeto

1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha seu repositório

### Passo 3: Configurar Build

1. Railway detecta automaticamente Next.js
2. Configure:
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### Passo 4: Variáveis de Ambiente

1. Vá em **Variables**
2. Adicione as mesmas variáveis do Vercel

---

## 🎯 Opção 3: Render

### Passo 1: Criar Conta

1. Acesse: https://render.com
2. Crie uma conta

### Passo 2: Criar Web Service

1. Clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório
3. Configure:
   - **Name**: `finora-web`
   - **Environment**: `Node`
   - **Build Command**: `cd apps/web && npm install && npm run build`
   - **Start Command**: `cd apps/web && npm start`
   - **Root Directory**: `apps/web`

### Passo 3: Variáveis de Ambiente

Adicione as mesmas variáveis do Vercel

---

## 🔧 Configurações Importantes

### 1. Supabase - Configurar URLs Permitidas

No painel do Supabase:
1. Vá em **Authentication → URL Configuration**
2. Adicione suas URLs de produção:
   - `https://seu-projeto.vercel.app`
   - `https://seu-dominio.com`
   - `https://seu-dominio.com/**` (wildcard)

### 2. CORS (se necessário)

Se houver problemas de CORS, configure no Supabase:
1. Vá em **Settings → API**
2. Adicione suas URLs em **Allowed Origins**

### 3. Variáveis de Ambiente de Produção

Certifique-se de usar:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` (URL do Supabase)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chave pública)
- ❌ **NÃO** use `SERVICE_ROLE_KEY` no frontend!

---

## 📦 Build Local (Testar Antes)

Antes de fazer deploy, teste o build localmente:

```bash
cd apps/web
npm run build
npm start
```

Se funcionar localmente, funcionará no deploy.

---

## 🐛 Troubleshooting

### Erro: "Module not found"
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` antes do build

### Erro: "Environment variables missing"
- Verifique se todas as variáveis estão configuradas no painel
- Use `NEXT_PUBLIC_` prefix para variáveis do cliente

### Erro: "Build failed"
- Verifique os logs do build
- Teste o build localmente primeiro
- Verifique se o `package.json` tem scripts corretos

### Erro: "Supabase connection failed"
- Verifique se as URLs estão corretas
- Verifique se o Supabase permite conexões da sua URL
- Verifique CORS no Supabase

---

## 🚀 Deploy Automático

### GitHub Actions (Opcional)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: cd apps/web && npm run build
```

---

## 📊 Monitoramento

Após o deploy:
1. Teste todas as funcionalidades
2. Verifique logs de erro
3. Configure monitoramento (Vercel Analytics, Sentry, etc)
4. Configure alertas

---

## ✅ Checklist de Deploy

- [ ] Código commitado e pushado
- [ ] Build local funciona
- [ ] Variáveis de ambiente configuradas
- [ ] Supabase URLs permitidas configuradas
- [ ] Deploy realizado
- [ ] Testes funcionais realizados
- [ ] Domínio configurado (se aplicável)
- [ ] SSL/HTTPS funcionando
- [ ] Logs verificados

---

## 🎉 Pronto!

Seu app está no ar! Compartilhe a URL com seus testadores.

**Dica**: Para ambiente de staging, crie um branch separado e configure deploy automático apenas do branch `main` para produção.

