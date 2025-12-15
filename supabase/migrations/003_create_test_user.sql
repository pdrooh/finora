-- ============================================
-- CREATE TEST USER
-- Execute this in Supabase SQL Editor
-- ============================================

-- IMPORTANTE: Este script cria um usuário de teste
-- Email: teste@finora.com
-- Senha: Teste123!@#
-- 
-- Após executar, você pode fazer login normalmente
-- e testar todo o fluxo de onboarding

-- Criar usuário no auth.users
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Inserir usuário no auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'teste@finora.com',
    crypt('Teste123!@#', gen_salt('bf')), -- Senha: Teste123!@#
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Criar perfil automaticamente (via trigger handle_new_user)
  -- O trigger já faz isso, mas vamos garantir
  INSERT INTO public.profiles (user_id, onboarding_completed, onboarding_step)
  VALUES (new_user_id, false, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Criar subscription FREE
  INSERT INTO public.subscriptions (user_id, plano, status)
  VALUES (new_user_id, 'FREE', 'ACTIVE')
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'Usuário criado com sucesso!';
  RAISE NOTICE 'Email: teste@finora.com';
  RAISE NOTICE 'Senha: Teste123!@#';
  RAISE NOTICE 'User ID: %', new_user_id;
END $$;

