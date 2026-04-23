-- ============================================================
-- PMVM - Migración: columna locale en profiles
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Agregar columna locale a profiles
-- (permite guardar la preferencia de idioma del usuario)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS locale text DEFAULT 'es';

-- Actualizar el trigger handle_new_user para incluir locale
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, locale)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'locale', 'es')
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = excluded.full_name,
        phone     = excluded.phone;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VERIFICAR con:
--   SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'profiles' AND column_name = 'locale';
-- ============================================================
