-- Add privacy mode to profiles table
ALTER TABLE public.profiles 
ADD COLUMN privacy_mode text DEFAULT 'public' CHECK (privacy_mode IN ('public', 'private', 'secure'));

-- Create follows table for user relationships
CREATE TABLE public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS policies for follows table
CREATE POLICY "Users can view their own follows" 
ON public.follows 
FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create their own follows" 
ON public.follows 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" 
ON public.follows 
FOR DELETE 
USING (auth.uid() = follower_id);

-- Update posts policies to respect privacy settings
DROP POLICY IF EXISTS "Users can view active posts" ON public.posts;

CREATE POLICY "Users can view posts based on privacy settings" 
ON public.posts 
FOR SELECT 
USING (
  (status = 'active') AND 
  (
    -- Own posts are always visible
    (auth.uid() = user_id) OR 
    -- Admins can see all posts
    has_role(auth.uid(), 'admin'::app_role) OR
    -- Posts from users with public privacy
    (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = posts.user_id 
      AND profiles.privacy_mode = 'public'
    )) OR
    -- Posts from users with private privacy (only for followers)
    (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = posts.user_id 
      AND profiles.privacy_mode = 'private'
    ) AND EXISTS (
      SELECT 1 FROM public.follows 
      WHERE follows.following_id = posts.user_id 
      AND follows.follower_id = auth.uid()
    )) OR
    -- Posts from users with secure privacy (always visible but no personal details)
    (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = posts.user_id 
      AND profiles.privacy_mode = 'secure'
    ))
  )
);

-- Create index for better performance on follows queries
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_profiles_privacy_mode ON public.profiles(privacy_mode);