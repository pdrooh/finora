# 🧪 Guia de Testes - Finora

## ✅ Checklist de Testes

### 1. Autenticação
- [ ] Criar nova conta
- [ ] Fazer login
- [ ] Verificar redirecionamento após login
- [ ] Testar logout

### 2. Onboarding
- [ ] Completar todas as 4 etapas
- [ ] Verificar salvamento parcial
- [ ] Verificar redirecionamento para dashboard após conclusão

### 3. Receitas
- [ ] Listar receitas
- [ ] Criar nova receita (Fixa e Extra)
- [ ] Editar receita
- [ ] Excluir receita
- [ ] Filtrar por tipo
- [ ] Buscar receitas

### 4. Despesas
- [ ] Listar despesas
- [ ] Criar despesa fixa
- [ ] Criar despesa variável
- [ ] Criar despesa parcelada (verificar geração de parcelas)
- [ ] Editar despesa
- [ ] Excluir despesa
- [ ] Filtrar por tipo
- [ ] Buscar despesas

### 5. Dívidas
- [ ] Listar dívidas
- [ ] Criar nova dívida
- [ ] Verificar barra de progresso
- [ ] Editar dívida
- [ ] Excluir dívida
- [ ] Filtrar por status

### 6. Metas
- [ ] Listar metas
- [ ] Criar nova meta
- [ ] Verificar barra de progresso
- [ ] Editar meta
- [ ] Excluir meta
- [ ] Filtrar por status

### 7. Dashboard
- [ ] Verificar cards de resumo
- [ ] Verificar gráfico de linha (evolução)
- [ ] Verificar gráfico de pizza (categorias)
- [ ] Verificar gráfico de barras (saldo)
- [ ] Testar tabs (Visão Geral, Tendências, Categorias)
- [ ] Verificar dados dos últimos 6 meses

### 8. Quick Add
- [ ] Clicar no botão flutuante
- [ ] Ver menu de ações rápidas
- [ ] Adicionar receita rápida
- [ ] Adicionar despesa rápida
- [ ] Navegar para criar dívida/meta

### 9. Configurações
- [ ] Atualizar perfil
- [ ] Adicionar categoria personalizada
- [ ] Excluir categoria personalizada
- [ ] Verificar categorias padrão

### 10. Relatórios
- [ ] Selecionar mês/ano
- [ ] Ver resumo financeiro
- [ ] Exportar CSV
- [ ] Verificar dados exportados

### 11. UI/UX
- [ ] Testar tema claro/escuro
- [ ] Verificar Command Palette (Cmd+K)
- [ ] Testar sidebar (colapsar/expandir)
- [ ] Verificar empty states
- [ ] Verificar responsividade

## 🐛 Problemas Conhecidos

- Export PDF ainda não implementado (mostra mensagem)
- Alteração de senha em desenvolvimento (placeholder)
- Alguns componentes podem precisar de ajustes de estilo

## 📝 Notas

- Certifique-se de que o Supabase está configurado corretamente
- Verifique se as migrations foram executadas
- O projeto roda na porta 3000 por padrão

