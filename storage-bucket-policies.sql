-- Storage bucket policies for category-images

-- Drop existing policies first
DROP POLICY IF EXISTS "Public can view category images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload category images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update category images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete category images" ON storage.objects;

-- Allow public to view images
CREATE POLICY "Public can view category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

-- Allow admin to upload images
CREATE POLICY "Admin can upload category images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'category-images' 
  AND auth.jwt()->>'email' = 'nanthini@thisaitech.com'
);

-- Allow admin to update images
CREATE POLICY "Admin can update category images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'category-images' 
  AND auth.jwt()->>'email' = 'nanthini@thisaitech.com'
);

-- Allow admin to delete images
CREATE POLICY "Admin can delete category images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'category-images' 
  AND auth.jwt()->>'email' = 'nanthini@thisaitech.com'
);
