/**
 * Script para criar usuário de teste no Supabase
 * 
 * Execute: node scripts/create-test-user.js
 * 
 * Requer: SUPABASE_SERVICE_ROLE_KEY no .env.local
 */

require('dotenv').config({ path: './apps/web/.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!')
  console.error('Certifique-se de que .env.local contém:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Usar service role para criar usuário
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createTestUser() {
  const email = 'teste@finora.com'
  const password = 'Teste123!@#'

  try {
    console.log('🔄 Criando usuário de teste...')
    console.log(`   Email: ${email}`)
    console.log(`   Senha: ${password}`)

    // Criar usuário via Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automaticamente
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Usuário já existe!')
        console.log('   Você pode usar as credenciais acima para fazer login.')
        return
      }
      throw authError
    }

    if (!authData.user) {
      throw new Error('Usuário não foi criado')
    }

    const userId = authData.user.id
    console.log(`✅ Usuário criado! ID: ${userId}`)

    // Verificar se perfil foi criado (deve ser automático via trigger)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.log('⚠️  Perfil não encontrado, criando...')
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          onboarding_completed: false,
          onboarding_step: 0,
        })

      if (insertError) {
        console.error('❌ Erro ao criar perfil:', insertError)
      } else {
        console.log('✅ Perfil criado!')
      }
    } else {
      console.log('✅ Perfil já existe (criado via trigger)')
    }

    // Verificar subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!subscription) {
      console.log('⚠️  Subscription não encontrada, criando...')
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plano: 'FREE',
          status: 'ACTIVE',
        })

      if (subError) {
        console.error('❌ Erro ao criar subscription:', subError)
      } else {
        console.log('✅ Subscription criada!')
      }
    } else {
      console.log('✅ Subscription já existe')
    }

    console.log('')
    console.log('🎉 Usuário de teste criado com sucesso!')
    console.log('')
    console.log('📋 Credenciais:')
    console.log(`   Email: ${email}`)
    console.log(`   Senha: ${password}`)
    console.log('')
    console.log('🚀 Próximos passos:')
    console.log('   1. Acesse: http://localhost:3000/login')
    console.log('   2. Faça login com as credenciais acima')
    console.log('   3. Complete o onboarding')
    console.log('   4. Teste todas as funcionalidades!')
    console.log('')

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message)
    if (error.message.includes('already registered')) {
      console.log('')
      console.log('💡 O usuário já existe. Use as credenciais para fazer login:')
      console.log(`   Email: ${email}`)
      console.log(`   Senha: ${password}`)
    }
    process.exit(1)
  }
}

createTestUser()

