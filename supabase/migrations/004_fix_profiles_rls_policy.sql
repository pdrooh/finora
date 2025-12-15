-- ============================================
-- FIX PROFILES RLS POLICY
-- Adiciona WITH CHECK na política de UPDATE
-- ============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate with WITH CHECK
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

