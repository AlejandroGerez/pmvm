-- ============================================================
-- Setup: Storage bucket for user avatars
-- Run once in Supabase Dashboard → SQL Editor
-- ============================================================

-- Create the avatars bucket (public so URLs can be read without auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can upload their own avatar"  ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar"  ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar"  ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly readable"       ON storage.objects;

-- Anyone can read (bucket is public, but explicit policy is cleaner)
CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload to their own folder: avatars/{uid}/...
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can replace their own avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
