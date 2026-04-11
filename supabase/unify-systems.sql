-- ============================================================
-- UNIFICACIÓN WEB ↔ MOBILE
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- 1. user_profiles view: agrega phone, sex, locale, trainer
-- 2. assign_goals_for_date: incluye goal_assignments del trainer
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. Recrear VIEW user_profiles con todos los campos del perfil
--    DROP CASCADE elimina los triggers viejos → los recreamos abajo.
-- ─────────────────────────────────────────────

DROP VIEW IF EXISTS public.user_profiles CASCADE;

CREATE VIEW public.user_profiles AS
SELECT
  p.id                                              AS id,
  p.id                                              AS user_id,
  p.full_name,
  p.avatar_url,
  p.phone,
  p.sex,
  p.locale,
  p.trainer_id,
  t.full_name                                       AS trainer_name,
  t.phone                                           AS trainer_phone,
  COALESCE(p.level, 'Principiante')                AS level,
  p.plan_name,
  p.plan_duration_weeks,
  COALESCE(p.plan_current_week, 1)                 AS plan_current_week,
  p.onboarding_completed,
  p.created_at,
  p.updated_at
FROM public.profiles p
LEFT JOIN public.profiles t ON t.id = p.trainer_id;

-- Recrear INSTEAD OF INSERT (mobile crea perfil si no existe)
CREATE OR REPLACE FUNCTION fn_user_profiles_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, avatar_url,
    level, plan_name, plan_duration_weeks, plan_current_week
  )
  VALUES (
    NEW.user_id, NEW.full_name, NEW.avatar_url,
    COALESCE(NEW.level, 'Principiante'), NEW.plan_name,
    NEW.plan_duration_weeks, COALESCE(NEW.plan_current_week, 1)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name           = COALESCE(EXCLUDED.full_name,           profiles.full_name),
    avatar_url          = COALESCE(EXCLUDED.avatar_url,          profiles.avatar_url),
    level               = COALESCE(EXCLUDED.level,               profiles.level),
    plan_name           = COALESCE(EXCLUDED.plan_name,           profiles.plan_name),
    plan_duration_weeks = COALESCE(EXCLUDED.plan_duration_weeks, profiles.plan_duration_weeks),
    plan_current_week   = COALESCE(EXCLUDED.plan_current_week,   profiles.plan_current_week),
    updated_at          = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_user_profiles_insert
  INSTEAD OF INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_user_profiles_insert();

-- Recrear INSTEAD OF UPDATE (mobile actualiza nombre, avatar, nivel, etc.)
CREATE OR REPLACE FUNCTION fn_user_profiles_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET
    full_name           = COALESCE(NEW.full_name,           OLD.full_name),
    avatar_url          = COALESCE(NEW.avatar_url,          OLD.avatar_url),
    level               = COALESCE(NEW.level,               OLD.level),
    plan_name           = COALESCE(NEW.plan_name,           OLD.plan_name),
    plan_duration_weeks = COALESCE(NEW.plan_duration_weeks, OLD.plan_duration_weeks),
    plan_current_week   = COALESCE(NEW.plan_current_week,   OLD.plan_current_week),
    updated_at          = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_user_profiles_update
  INSTEAD OF UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_user_profiles_update();

-- ─────────────────────────────────────────────
-- 2. Reemplazar assign_goals_for_date
--    Crea daily_goals desde:
--      a) goal_templates activos (comportamiento original)
--      b) goal_assignments activos del trainer (comportamiento nuevo)
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.assign_goals_for_date(
  p_user_id uuid,
  p_date    date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

  -- ── a) Desde goal_templates globales activos ───────────────────────────────
  INSERT INTO public.daily_goals (
    user_id, date, text, completed, sort_order,
    goal_type, target_value, current_value, target_unit, auto_track, template_id
  )
  SELECT
    p_user_id,
    p_date,
    gt.title,
    false,
    gt.sort_order,
    gt.goal_type::text,
    gt.target_value,
    0,
    gt.target_unit::text,
    (gt.goal_type IN ('hydration','steps','training','meals')),
    gt.id
  FROM public.goal_templates gt
  WHERE gt.is_active = true
    -- Evitar duplicar si ya existe para esta fecha + template
    AND NOT EXISTS (
      SELECT 1 FROM public.daily_goals dg
      WHERE dg.user_id    = p_user_id
        AND dg.date       = p_date
        AND dg.template_id = gt.id
    );

  -- ── b) Desde goal_assignments del trainer ─────────────────────────────────
  INSERT INTO public.daily_goals (
    user_id, date, text, completed, sort_order,
    goal_type, target_value, current_value, target_unit, auto_track, template_id
  )
  SELECT
    p_user_id,
    p_date,
    ga.title,
    false,
    100 + ROW_NUMBER() OVER (ORDER BY ga.created_at),
    ga.goal_type,
    ga.target_value,
    0,
    ga.target_unit,
    (ga.goal_type IN ('hydration','steps','training','meals')),
    ga.template_id
  FROM public.goal_assignments ga
  WHERE ga.user_id    = p_user_id
    AND ga.is_active  = true
    AND ga.start_date <= p_date
    AND (ga.end_date  IS NULL OR ga.end_date >= p_date)
    -- Evitar duplicar si ya existe un goal con el mismo título para esta fecha
    AND NOT EXISTS (
      SELECT 1 FROM public.daily_goals dg
      WHERE dg.user_id = p_user_id
        AND dg.date    = p_date
        AND dg.text    = ga.title
    );

END;
$$;

-- ─────────────────────────────────────────────
-- 3. Trigger: cuando el admin crea/modifica un goal_assignment
--    → materializar daily_goals para hoy inmediatamente
--    (sin esperar a que el usuario abra la app)
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_materialize_goal_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear el goal de hoy si cae dentro del rango
  IF NEW.is_active = true
     AND NEW.start_date <= CURRENT_DATE
     AND (NEW.end_date IS NULL OR NEW.end_date >= CURRENT_DATE)
  THEN
    PERFORM public.assign_goals_for_date(NEW.user_id, CURRENT_DATE);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_materialize_goal_on_assign ON public.goal_assignments;
CREATE TRIGGER trg_materialize_goal_on_assign
  AFTER INSERT OR UPDATE ON public.goal_assignments
  FOR EACH ROW EXECUTE FUNCTION fn_materialize_goal_assignment();

-- ─────────────────────────────────────────────
-- VERIFICAR con:
--   -- Ver campos nuevos en la view:
--   SELECT user_id, full_name, phone, sex, locale, trainer_name, trainer_phone
--   FROM public.user_profiles LIMIT 5;
--
--   -- Ver función:
--   SELECT routine_name FROM pg_proc WHERE proname = 'assign_goals_for_date';
-- ─────────────────────────────────────────────
