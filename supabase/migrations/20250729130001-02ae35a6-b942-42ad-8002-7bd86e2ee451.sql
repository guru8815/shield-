-- Create storage buckets for media uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('evidence-images', 'evidence-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('evidence-videos', 'evidence-videos', true, 104857600, ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo']);

-- Create storage policies for evidence uploads
CREATE POLICY "Anyone can view evidence images" ON storage.objects
  FOR SELECT USING (bucket_id = 'evidence-images');

CREATE POLICY "Anyone can view evidence videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'evidence-videos');

CREATE POLICY "Authenticated users can upload evidence images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'evidence-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can upload evidence videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'evidence-videos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own evidence files" ON storage.objects
  FOR UPDATE USING (
    (bucket_id = 'evidence-images' OR bucket_id = 'evidence-videos')
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own evidence files" ON storage.objects
  FOR DELETE USING (
    (bucket_id = 'evidence-images' OR bucket_id = 'evidence-videos')
    AND auth.role() = 'authenticated'
  );

-- Add media_urls column to posts table for storing uploaded file URLs
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_urls TEXT[];

-- Add submission_type column to track if it's anonymous or not
ALTER TABLE posts ADD COLUMN IF NOT EXISTS submission_type TEXT DEFAULT 'anonymous';

-- Add location column for district/location tracking
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location TEXT;