-- Add video support to hero_banners table

-- Add video_url column
ALTER TABLE hero_banners 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add media_type column (image or video)
ALTER TABLE hero_banners 
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video'));

-- Add comment
COMMENT ON COLUMN hero_banners.video_url IS 'Video URL for hero banner (alternative to images)';
COMMENT ON COLUMN hero_banners.media_type IS 'Type of media: image or video';
