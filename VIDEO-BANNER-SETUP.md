# Hero Banner Video Support - Implementation Guide

## Overview
Added video support to hero banners. Admins can now upload video files (MP4, WebM, OGG) or choose images for hero banners. No UI or functionality changes - videos play exactly where images were displayed.

## Database Changes

### SQL Migration
Run the SQL file in Supabase SQL Editor:
```
add-video-to-banners.sql
```

This adds:
- `video_url` TEXT column
- `media_type` TEXT column (default: 'image', CHECK: 'image' or 'video')

## Admin Interface Changes

### Banner Management (`src/app/admin/banners/page.tsx`)

**New Features:**
1. **Media Type Selector**: Radio buttons to choose between Image or Video
2. **Video File Upload**: Shows when "Video" is selected
   - File upload input (accepts MP4, WebM, OGG)
   - File validation (max 50MB)
   - Live video preview with gradient overlay
   - Remove video button
   - Upload progress indicator
3. **Conditional Rendering**:
   - Image fields (Desktop/Mobile) show when "Image" is selected
   - Video upload field shows when "Video" is selected
4. **Banner Card Display**: Shows 🎥 Video indicator for video banners

**Interface Updates:**
```typescript
interface Banner {
  // ... existing fields
  video_url: string | null;
  media_type: 'image' | 'video';
}
```

## User Interface Changes

### Hero Carousel (`src/components/home/HeroCarousel2.tsx`)

**Video Rendering:**
- Conditionally renders `<video>` tag when `media_type === 'video'`
- Video attributes:
  - `autoPlay`: Plays automatically
  - `loop`: Loops continuously
  - `muted`: Muted by default
  - `playsInline`: Plays inline on mobile
  - `className`: Same styling as images (w-full h-full object-cover)
- Gradient overlay applied same as images
- All text overlays (title, subtitle, button) work identically

**Fallback Support:**
- All fallback slides updated with `video_url: null` and `media_type: 'image'`

## How to Use (Admin)

### Adding a Video Banner:
1. Go to Admin → Banners
2. Click "Add New Banner"
3. Fill in Title, Subtitle, Badge Text, Button details
4. **Select "Video" as Media Type**
5. Click "Choose File" and select your video file (MP4, WebM, or OGG)
6. Wait for upload to complete (progress indicator will show)
7. Video preview will appear with gradient overlay
8. Choose background color (gradient overlay)
9. Save banner

### Adding an Image Banner (Same as Before):
1. Select "Image" as Media Type
2. Upload Desktop and Mobile images
3. Everything else remains the same

## Technical Details

### Video Requirements:
- **Format**: MP4, WebM, or OGG (MP4 recommended for best browser support)
- **Size**: Max 50MB (validated before upload)
- **Resolution**: 1920x1080 recommended
- **Storage**: Uploaded to Supabase Storage (`category-images` bucket)

### Styling:
- Videos use identical sizing as images:
  - Mobile: `h-[500px]`
  - Desktop: `h-[400px]`
- Object-fit: `cover` (fills space, crops if needed)
- Gradient overlay: Same as image banners
- No UI/layout changes

### Browser Support:
- Modern browsers support `<video>` with autoplay, loop, muted
- `playsInline` ensures mobile compatibility
- Fallback: If video fails to load, gradient background shows

## Files Changed

1. **SQL Migration**:
   - `add-video-to-banners.sql` (new)

2. **Admin Interface**:
   - `src/app/admin/banners/page.tsx`
     - Updated Banner interface
     - Added media_type selector
     - Added video_url input
     - Added conditional rendering
     - Updated banner card display

3. **User Interface**:
   - `src/components/home/HeroCarousel2.tsx`
     - Updated Banner interface
     - Added video rendering logic
     - Updated fallback slides
     - Maintained all existing animations/transitions

## Testing Checklist

- [ ] Run SQL migration in Supabase
- [ ] Add a test video banner in admin
- [ ] Verify video plays on homepage (autoplay, loop, muted)
- [ ] Check mobile responsiveness (video sizing)
- [ ] Verify gradient overlay is visible
- [ ] Test text overlay (title, subtitle, button) is readable
- [ ] Add a test image banner
- [ ] Verify existing image banners still work
- [ ] Test carousel navigation with mixed image/video banners
- [ ] Check video playback on different browsers (Chrome, Safari, Firefox)

## Migration Steps

1. **Apply Database Changes**:
   ```sql
   -- Run in Supabase SQL Editor
   -- File: add-video-to-banners.sql
   ```

2. **Deploy Code**:
   - Updated admin and user components already in code
   - No build required if using development server
   - For production: Build and deploy

3. **Test**:
   - Create test video banner
   - Verify playback
   - Check all existing banners still work

## Notes

- **Backward Compatible**: All existing image banners continue to work
- **Default Behavior**: New banners default to `media_type: 'image'`
- **No Breaking Changes**: UI, sizing, animations unchanged
- **Performance**: Videos may increase page load time - recommend optimized videos
- **Accessibility**: Videos are muted and decorative (same as background images)

## Support

For issues or questions:
1. Check video URL is publicly accessible
2. Verify video format (MP4 preferred)
3. Check browser console for errors
4. Ensure database migration ran successfully
