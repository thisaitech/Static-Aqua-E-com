-- Create storage bucket for banner videos
-- Run this in Supabase SQL Editor

-- Create the bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('banner-videos', 'banner-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view banner videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload banner videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update banner videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banner videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload banner videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update banner videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete banner videos" ON storage.objects;

-- Set up storage policies for banner-videos bucket

-- Allow public to read videos (same as images)
CREATE POLICY "Public can view banner videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'banner-videos');

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload banner videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banner-videos');

-- Allow authenticated users to update videos
CREATE POLICY "Authenticated users can update banner videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'banner-videos');

-- Allow authenticated users to delete videos
CREATE POLICY "Authenticated users can delete banner videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'banner-videos');
