-- ============================================================
-- PMVM - Migración: onboarding de cliente
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Agregar columna sex (puede ser null mientras no completa onboarding)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sex text CHECK (sex IN ('male', 'female', 'other'));

-- 2. Agregar flag de onboarding completado
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- 3. Admins ya no necesitan onboarding → marcarlos como completados
UPDATE public.profiles
  SET onboarding_completed = true
  WHERE role = 'admin';

-- 4. Clientes que ya tienen teléfono Y sexo → también completados
UPDATE public.profiles
  SET onboarding_completed = true
  WHERE role != 'admin'
    AND phone IS NOT NULL AND phone != ''
    AND sex   IS NOT NULL;

-- 5. Actualizar trigger para que nuevos usuarios arranquen con onboarding_completed = false
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    false
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        phone     = COALESCE(profiles.phone, EXCLUDED.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VERIFICAR con:
--   SELECT id, full_name, role, phone, sex, onboarding_completed
--   FROM public.profiles ORDER BY role, full_name;
-- ============================================================
