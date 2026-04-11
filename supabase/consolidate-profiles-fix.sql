-- ============================================================
-- FIX: user_profiles ya es una VIEW → usar INSTEAD OF triggers
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- ESTADO ACTUAL:
--   user_profiles = VIEW de profiles (creada por el script anterior)
--   Problema: la mobile hace INSERT/UPSERT en user_profiles → falla en views
--   Solución: INSTEAD OF triggers que redirigen escrituras a profiles
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. Asegurarse de que profiles tiene las columnas de mobile
--    (puede que ya se hayan agregado en el script anterior)
-- ─────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS level               text    DEFAULT 'Principiante',
  ADD COLUMN IF NOT EXISTS plan_name           text,
  ADD COLUMN IF NOT EXISTS plan_duration_weeks integer,
  ADD COLUMN IF NOT EXISTS plan_current_week   integer DEFAULT 1;

-- ─────────────────────────────────────────────
-- 2. Recrear la view con los campos completos
--    (asegurar que tiene user_id como alias de id)
-- ─────────────────────────────────────────────

CREATE OR REPLACE VIEW public.user_profiles AS
SELECT
  id                                             AS id,
  id                                             AS user_id,
  full_name,
  avatar_url,
  COALESCE(level, 'Principiante')                AS level,
  plan_name,
  plan_duration_weeks,
  COALESCE(plan_current_week, 1)                 AS plan_current_week,
  created_at,
  updated_at
FROM public.profiles;

-- ─────────────────────────────────────────────
-- 3. INSTEAD OF INSERT: mobile hace INSERT → escribe en profiles
--    Cubre: getProfile() que crea perfil si no existe
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_user_profiles_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, avatar_url,
    level, plan_name, plan_duration_weeks, plan_current_week
  )
  VALUES (
    NEW.user_id,
    NEW.full_name,
    NEW.avatar_url,
    COALESCE(NEW.level, 'Principiante'),
    NEW.plan_name,
    NEW.plan_duration_weeks,
    COALESCE(NEW.plan_current_week, 1)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name            = COALESCE(EXCLUDED.full_name,            profiles.full_name),
    avatar_url           = COALESCE(EXCLUDED.avatar_url,           profiles.avatar_url),
    level                = COALESCE(EXCLUDED.level,                profiles.level),
    plan_name            = COALESCE(EXCLUDED.plan_name,            profiles.plan_name),
    plan_duration_weeks  = COALESCE(EXCLUDED.plan_duration_weeks,  profiles.plan_duration_weeks),
    plan_current_week    = COALESCE(EXCLUDED.plan_current_week,    profiles.plan_current_week),
    updated_at           = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_user_profiles_insert ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_insert
  INSTEAD OF INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_user_profiles_insert();

-- ─────────────────────────────────────────────
-- 4. INSTEAD OF UPDATE: mobile hace UPDATE → escribe en profiles
--    Cubre: updateProfile() con campos de nivel, plan, avatar
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_user_profiles_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET
    full_name            = COALESCE(NEW.full_name,            OLD.full_name),
    avatar_url           = COALESCE(NEW.avatar_url,           OLD.avatar_url),
    level                = COALESCE(NEW.level,                OLD.level),
    plan_name            = COALESCE(NEW.plan_name,            OLD.plan_name),
    plan_duration_weeks  = COALESCE(NEW.plan_duration_weeks,  OLD.plan_duration_weeks),
    plan_current_week    = COALESCE(NEW.plan_current_week,    OLD.plan_current_week),
    updated_at           = now()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_user_profiles_update ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_update
  INSTEAD OF UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_user_profiles_update();

-- ─────────────────────────────────────────────
-- 5. Hacer las vistas UNRESTRICTED más seguras
-- ─────────────────────────────────────────────

ALTER VIEW public.v_goal_assignments_admin    SET (security_barrier = true);
ALTER VIEW public.v_routine_assignments_admin SET (security_barrier = true);

-- ─────────────────────────────────────────────
-- VERIFICAR con:
--
--   -- Los campos de nivel ya están en profiles?
--   SELECT id, full_name, level, plan_name FROM public.profiles LIMIT 5;
--
--   -- La view devuelve datos correctos?
--   SELECT * FROM public.user_profiles LIMIT 5;
--
--   -- Los triggers están creados?
--   SELECT trigger_name, event_manipulation, event_object_table
--   FROM information_schema.triggers
--   WHERE event_object_table = 'user_profiles';
-- ─────────────────────────────────────────────
