# 👤 Criar Usuário de Teste

## 📝 Credenciais de Teste

Após executar o script SQL, use estas credenciais:

- **Email**: `teste@finora.com`
- **Senha**: `Teste123!@#`

## 🚀 Como Criar o Usuário

### Opção 1: Via SQL Editor (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/hklzdawonkilsiedfqnm
2. Vá em **SQL Editor**
3. Execute o arquivo: `supabase/migrations/003_create_test_user.sql`
4. Verifique a mensagem de sucesso

### Opção 2: Via Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/hklzdawonkilsiedfqnm
2. Vá em **Authentication** → **Users**
3. Clique em **Add User** → **Create new user**
4. Preencha:
   - Email: `teste@finora.com`
   - Senha: `Teste123!@#`
   - Auto Confirm User: ✅ (marcado)
5. Clique em **Create User**

## ✅ Após Criar

1. O perfil será criado automaticamente (via trigger)
2. A subscription FREE será criada automaticamente
3. Você pode fazer login normalmente em: http://localhost:3000/login
4. O onboarding aparecerá automaticamente (já que `onboarding_completed = false`)

## 🧪 Fluxo de Teste

1. **Login**: Use as credenciais acima
2. **Onboarding**: Complete as 4 etapas
3. **Dashboard**: Explore os gráficos e resumos
4. **CRUDs**: Teste criar receitas, despesas, dívidas e metas
5. **Quick Add**: Use o botão flutuante (+)
6. **Command Palette**: Pressione `Cmd+K` ou `Ctrl+K`
7. **Configurações**: Teste adicionar categorias
8. **Relatórios**: Exporte CSV

## 🔐 Segurança

⚠️ **IMPORTANTE**: Este é um usuário de teste. Em produção:
- Use senhas fortes
- Não compartilhe credenciais
- Remova usuários de teste antes do deploy

---

**Pronto para testar! 🎉**

