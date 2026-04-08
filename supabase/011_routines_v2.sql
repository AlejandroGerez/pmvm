-- ============================================================
-- 011 - ROUTINES V2: Exercise library + routine templates + assignments
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================


-- ── 1. EXERCISE LIBRARY ──────────────────────────────────────
-- Cache local de ejercicios (desde ExerciseDB API o custom)
CREATE TABLE IF NOT EXISTS public.exercises (
  id                TEXT PRIMARY KEY,           -- ID del API o UUID para custom
  name              TEXT NOT NULL,
  body_part         TEXT,                        -- chest, back, legs, etc.
  equipment         TEXT,                        -- barbell, dumbbell, bodyweight, etc.
  target_muscle     TEXT,                        -- músculo principal
  secondary_muscles TEXT[]  DEFAULT '{}',
  gif_url           TEXT,                        -- GIF animado del ejercicio
  instructions      TEXT[]  DEFAULT '{}',
  source            TEXT    DEFAULT 'api'        -- 'api' | 'custom'
    CHECK (source IN ('api', 'custom')),
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver ejercicios
CREATE POLICY "exercises_select_authenticated" ON public.exercises
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Solo admins pueden insertar/actualizar ejercicios custom
CREATE POLICY "exercises_insert_admin" ON public.exercises
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "exercises_update_admin" ON public.exercises
  FOR UPDATE USING (public.is_admin());

-- ── 2. UPDATE ROUTINES TABLE ─────────────────────────────────
-- Las rutinas pasan a ser plantillas reutilizables.
-- client_id ahora es nullable (las templates no tienen cliente asignado)

ALTER TABLE public.routines ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE public.routines
  ADD COLUMN IF NOT EXISTS is_template     BOOLEAN   DEFAULT true,
  ADD COLUMN IF NOT EXISTS category        TEXT,
  ADD COLUMN IF NOT EXISTS difficulty      TEXT      DEFAULT 'intermediate'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  ADD COLUMN IF NOT EXISTS estimated_min   INT,       -- duración estimada en minutos
  ADD COLUMN IF NOT EXISTS days_per_week_v2 INT,      -- dias por semana (reemplaza days_per_week)
  ADD COLUMN IF NOT EXISTS color           TEXT      DEFAULT '#D1FF26',
  ADD COLUMN IF NOT EXISTS created_by      UUID      REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW();

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS routines_updated_at ON public.routines;
CREATE TRIGGER routines_updated_at
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Policies adicionales para que el admin pueda gestionar rutinas
DROP POLICY IF EXISTS "routines_admin_all" ON public.routines;
CREATE POLICY "routines_admin_all" ON public.routines
  FOR ALL USING (public.is_admin());

-- ── 3. UPDATE ROUTINE_EXERCISES ──────────────────────────────
-- Conectar ejercicios a la librería, agregar campos extra

ALTER TABLE public.routine_exercises
  ADD COLUMN IF NOT EXISTS exercise_id    TEXT REFERENCES public.exercises(id),
  ADD COLUMN IF NOT EXISTS tempo          TEXT,        -- ej: "3-1-2" (excéntrico-pausa-concéntrico)
  ADD COLUMN IF NOT EXISTS weight_note    TEXT,        -- ej: "70% 1RM" o "moderado"
  ADD COLUMN IF NOT EXISTS exercise_notes TEXT;        -- notas específicas del ejercicio en esta rutina

-- Admin puede gestionar ejercicios de rutinas
DROP POLICY IF EXISTS "routine_exercises_admin_all" ON public.routine_exercises;
CREATE POLICY "routine_exercises_admin_all" ON public.routine_exercises
  FOR ALL USING (public.is_admin());

-- ── 4. ROUTINE ASSIGNMENTS ───────────────────────────────────
-- El admin asigna rutinas template a usuarios con fecha de inicio/fin

CREATE TABLE IF NOT EXISTS public.routine_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id    UUID    NOT NULL REFERENCES public.routines(id)   ON DELETE CASCADE,
  user_id       UUID    NOT NULL REFERENCES auth.users(id)        ON DELETE CASCADE,
  assigned_by   UUID    REFERENCES auth.users(id),
  start_date    DATE    NOT NULL DEFAULT CURRENT_DATE,
  end_date      DATE,
  week_days     INT[]   DEFAULT '{1,3,5}',  -- 0=Dom, 1=Lun, ..., 6=Sab
  is_active     BOOLEAN DEFAULT true,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

ALTER TABLE public.routine_assignments ENABLE ROW LEVEL SECURITY;

-- Admin gestiona todo
CREATE POLICY "routine_assignments_admin" ON public.routine_assignments
  FOR ALL USING (public.is_admin());

-- Clientes ven sus propias asignaciones
CREATE POLICY "routine_assignments_client_select" ON public.routine_assignments
  FOR SELECT USING (auth.uid() = user_id);

-- ── 5. VISTA ADMIN: asignaciones enriquecidas ────────────────
CREATE OR REPLACE VIEW public.v_routine_assignments_admin AS
SELECT
  ra.id,
  ra.routine_id,
  ra.user_id,
  ra.assigned_by,
  ra.start_date,
  ra.end_date,
  ra.week_days,
  ra.is_active,
  ra.notes,
  ra.created_at,
  -- Datos del usuario
  p.full_name        AS user_name,
  -- Datos de la rutina
  r.name             AS routine_name,
  r.category         AS routine_category,
  r.difficulty       AS routine_difficulty,
  r.color            AS routine_color,
  r.estimated_min    AS routine_estimated_min,
  -- Status calculado
  CASE
    WHEN NOT ra.is_active                           THEN 'inactiva'
    WHEN ra.start_date > CURRENT_DATE               THEN 'futura'
    WHEN ra.end_date IS NOT NULL AND ra.end_date < CURRENT_DATE THEN 'vencida'
    ELSE 'activa'
  END AS status
FROM public.routine_assignments ra
JOIN public.routines r ON r.id = ra.routine_id
LEFT JOIN public.profiles p ON p.id = ra.user_id;

-- ── 6. FUNCIÓN: obtener rutinas activas de un usuario para una fecha ──
CREATE OR REPLACE FUNCTION public.get_routines_for_user(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  assignment_id UUID,
  routine_id    UUID,
  routine_name  TEXT,
  category      TEXT,
  difficulty    TEXT,
  color         TEXT,
  estimated_min INT,
  week_days     INT[],
  exercises     JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    ra.id,
    r.id,
    r.name,
    r.category,
    r.difficulty,
    r.color,
    r.estimated_min,
    ra.week_days,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id',             re.id,
          'name',           re.name,
          'sets',           re.sets,
          'reps',           re.reps,
          'rest_secs',      re.rest_secs,
          'order_index',    re.order_index,
          'tempo',          re.tempo,
          'weight_note',    re.weight_note,
          'exercise_notes', re.exercise_notes,
          'gif_url',        e.gif_url,
          'target_muscle',  e.target_muscle,
          'body_part',      e.body_part,
          'equipment',      e.equipment
        ) ORDER BY re.order_index
      )
      FROM public.routine_exercises re
      LEFT JOIN public.exercises e ON e.id = re.exercise_id
      WHERE re.routine_id = r.id),
      '[]'::jsonb
    )
  FROM public.routine_assignments ra
  JOIN public.routines r ON r.id = ra.routine_id
  WHERE ra.user_id = p_user_id
    AND ra.is_active = true
    AND ra.start_date <= p_date
    AND (ra.end_date IS NULL OR ra.end_date >= p_date)
    AND EXTRACT(DOW FROM p_date)::INT = ANY(ra.week_days);
END;
$$;

-- ── 7. GRANT ────────────────────────────────────────────────
GRANT SELECT ON public.exercises TO authenticated;
GRANT SELECT ON public.v_routine_assignments_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_routines_for_user(UUID, DATE) TO authenticated;

-- ── 8. ÍNDICES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS exercises_body_part_idx   ON public.exercises(body_part);
CREATE INDEX IF NOT EXISTS exercises_target_idx      ON public.exercises(target_muscle);
CREATE INDEX IF NOT EXISTS ra_user_date_idx          ON public.routine_assignments(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS ra_routine_idx            ON public.routine_assignments(routine_id);
