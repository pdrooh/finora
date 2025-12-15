-- ============================================
-- ENSURE PROFILE TRIGGER EXISTS
-- Garante que o trigger cria perfil automaticamente
-- ============================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, onboarding_completed, onboarding_step)
  VALUES (NEW.id, false, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.subscriptions (user_id, plano, status)
  VALUES (NEW.id, 'FREE', 'ACTIVE')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Garantir que usuários existentes tenham perfil
INSERT INTO public.profiles (user_id, onboarding_completed, onboarding_step)
SELECT id, false, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Garantir que usuários existentes tenham subscription
INSERT INTO public.subscriptions (user_id, plano, status)
SELECT id, 'FREE', 'ACTIVE'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.subscriptions)
ON CONFLICT (user_id) DO NOTHING;

