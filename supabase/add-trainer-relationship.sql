-- ============================================================
-- Relación trainer → cliente
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Agregar trainer_id a profiles
--    Cada cliente tiene UN solo trainer asignado (puede ser null).
--    Un trainer puede tener MUCHOS clientes.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trainer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Índice para buscar todos los clientes de un trainer
CREATE INDEX IF NOT EXISTS idx_profiles_trainer_id ON public.profiles(trainer_id);

-- 3. RLS: el cliente puede leer el perfil de su trainer (para obtener nombre y teléfono)
--    PostgreSQL no soporta "CREATE POLICY IF NOT EXISTS", así que usamos DO $$ ... $$.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'client_can_read_trainer_profile'
  ) THEN
    CREATE POLICY "client_can_read_trainer_profile" ON public.profiles
      FOR SELECT USING (
        -- El usuario puede ver su propio perfil
        auth.uid() = id
        -- O puede ver el perfil del trainer que tiene asignado
        OR id IN (
          SELECT trainer_id FROM public.profiles WHERE id = auth.uid()
        )
        -- O es admin (ya cubierto por política existente)
        OR EXISTS (
          SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- 4. Admin puede actualizar trainer_id de cualquier cliente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'admin_can_assign_trainer'
  ) THEN
    CREATE POLICY "admin_can_assign_trainer" ON public.profiles
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================================
-- NOTA: Para asignar un trainer a un cliente desde el admin,
-- usá el panel de clientes en /admin/clients/{id}.
--
-- Para asignar manualmente en SQL:
-- UPDATE public.profiles SET trainer_id = 'UUID_DEL_TRAINER' WHERE id = 'UUID_DEL_CLIENTE';
--
-- Para ver todos los clientes de un trainer:
-- SELECT * FROM public.profiles WHERE trainer_id = 'UUID_DEL_TRAINER';
-- ============================================================
