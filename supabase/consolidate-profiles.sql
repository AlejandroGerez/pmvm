-- ============================================================
-- CONSOLIDACIÓN: sincronizar profiles ↔ user_profiles
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- CONTEXTO:
--   - profiles     → fuente de verdad del WEB (rol, trainer, phone, sex, etc.)
--   - user_profiles → fuente de verdad de la MOBILE (level, plan_name, etc.)
--   - full_name y avatar_url existen en AMBAS → pueden desincronizarse
--
-- SOLUCIÓN: triggers de sincronización bidireccional para los campos compartidos.
--           NO tocamos ni dropeamos ninguna tabla.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. Agregar a profiles los campos exclusivos de mobile
--    (para que el web también pueda mostrarlos si algún día los necesita)
-- ─────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS level               text    DEFAULT 'Principiante',
  ADD COLUMN IF NOT EXISTS plan_name           text,
  ADD COLUMN IF NOT EXISTS plan_duration_weeks integer,
  ADD COLUMN IF NOT EXISTS plan_current_week   integer DEFAULT 1;

-- ─────────────────────────────────────────────
-- 2. Migración inicial: copiar datos existentes
--    de user_profiles → profiles (sin sobrescribir lo que ya tiene profiles)
-- ─────────────────────────────────────────────

UPDATE public.profiles p
SET
  full_name            = COALESCE(p.full_name,            up.full_name),
  avatar_url           = COALESCE(p.avatar_url,           up.avatar_url),
  level                = COALESCE(p.level,                up.level),
  plan_name            = COALESCE(p.plan_name,            up.plan_name),
  plan_duration_weeks  = COALESCE(p.plan_duration_weeks,  up.plan_duration_weeks),
  plan_current_week    = COALESCE(p.plan_current_week,    up.plan_current_week)
FROM public.user_profiles up
WHERE up.user_id = p.id;

-- ─────────────────────────────────────────────
-- 3. Trigger: cuando mobile actualiza user_profiles → sincronizar profiles
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_user_profiles_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Sincronizar solo los campos compartidos
  UPDATE public.profiles
  SET
    full_name  = COALESCE(NEW.full_name, full_name),
    avatar_url = COALESCE(NEW.avatar_url, avatar_url),
    updated_at = now()
  WHERE id = NEW.user_id;

  -- Si no existía el perfil en profiles, crearlo (safety net para OAuth mobile)
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (NEW.user_id, NEW.full_name, NEW.avatar_url)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_user_profiles_to_profiles ON public.user_profiles;
CREATE TRIGGER trg_sync_user_profiles_to_profiles
  AFTER INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION sync_user_profiles_to_profiles();

-- ─────────────────────────────────────────────
-- 4. Trigger: cuando web actualiza profiles → sincronizar user_profiles
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_profiles_to_user_profiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo sincronizar si cambió full_name o avatar_url
  IF NEW.full_name IS DISTINCT FROM OLD.full_name
     OR NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN

    -- Intentar actualizar si existe en user_profiles
    UPDATE public.user_profiles
    SET
      full_name  = COALESCE(NEW.full_name, full_name),
      avatar_url = COALESCE(NEW.avatar_url, avatar_url)
    WHERE user_id = NEW.id;

    -- Si la mobile aún no creó el registro, lo creamos nosotros
    IF NOT FOUND THEN
      INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
      VALUES (NEW.id, NEW.full_name, NEW.avatar_url)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_profiles_to_user_profiles ON public.profiles;
CREATE TRIGGER trg_sync_profiles_to_user_profiles
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION sync_profiles_to_user_profiles();

-- ─────────────────────────────────────────────
-- 5. Trigger: cuando handle_new_user crea un registro en profiles
--    (registro de nuevo usuario vía web/OAuth), también crear en user_profiles
--    para que la mobile lo encuentre desde el primer momento.
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_new_profile_to_user_profiles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id, NEW.full_name, NEW.avatar_url)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_profile_to_user_profiles ON public.profiles;
CREATE TRIGGER trg_new_profile_to_user_profiles
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION sync_new_profile_to_user_profiles();

-- ─────────────────────────────────────────────
-- 6. Hacer las vistas UNRESTRICTED más seguras
-- ─────────────────────────────────────────────

ALTER VIEW public.v_goal_assignments_admin   SET (security_barrier = true);
ALTER VIEW public.v_routine_assignments_admin SET (security_barrier = true);

-- ─────────────────────────────────────────────
-- VERIFICAR con:
--   -- Ver sincronización: mismo full_name en ambas tablas?
--   SELECT p.id, p.full_name AS web_name, up.full_name AS app_name
--   FROM public.profiles p
--   LEFT JOIN public.user_profiles up ON up.user_id = p.id
--   WHERE p.full_name IS DISTINCT FROM up.full_name;
--   -- Debería retornar 0 filas si todo está sincronizado
-- ─────────────────────────────────────────────
