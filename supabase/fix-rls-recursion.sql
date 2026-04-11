-- ============================================================
-- FIX: Recursión infinita en RLS de profiles
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- El problema: las políticas consultaban profiles DESDE profiles,
-- causando recursión infinita. La solución es usar funciones
-- SECURITY DEFINER que leen la tabla sin pasar por RLS.

-- ─────────────────────────────────────────────
-- 1. Funciones helper (leen profiles sin RLS)
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.my_trainer_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT trainer_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ─────────────────────────────────────────────
-- 2. Eliminar las políticas problemáticas
-- ─────────────────────────────────────────────

DROP POLICY IF EXISTS "client_can_read_trainer_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_can_assign_trainer"        ON public.profiles;

-- También eliminamos las que pueden existir con nombres similares
DROP POLICY IF EXISTS "Users can view own profile"      ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"    ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles"  ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- ─────────────────────────────────────────────
-- 3. Recrear las políticas sin recursión
-- ─────────────────────────────────────────────

-- SELECT: cada usuario ve su propio perfil
--         + el perfil de su trainer
--         + admins ven todo
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id                          -- su propio perfil
    OR id = public.my_trainer_id()           -- perfil de su trainer
    OR public.my_role() = 'admin'            -- admins ven todos
  );

-- INSERT: solo se crea vía trigger handle_new_user (service role)
-- No necesitamos política INSERT para usuarios normales.

-- UPDATE: usuario actualiza su propio perfil (onboarding, settings)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- UPDATE: admin puede actualizar cualquier perfil (ej: asignar trainer)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.my_role() = 'admin');

-- ─────────────────────────────────────────────
-- 4. Asegurarse de que RLS está habilitado
-- ─────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- VERIFICAR con:
--   SELECT policyname, cmd, qual FROM pg_policies
--   WHERE tablename = 'profiles';
-- ─────────────────────────────────────────────
