-- Create stories table for ephemeral 24-hour content
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image', -- 'image' or 'video'
  caption TEXT,
  location TEXT,
  music_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policies for stories
CREATE POLICY "Users can create their own stories" 
ON public.stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view active stories based on privacy settings" 
ON public.stories 
FOR SELECT 
USING (
  is_active = true 
  AND expires_at > now() 
  AND (
    auth.uid() = user_id 
    OR has_role(auth.uid(), 'admin'::app_role)
    OR (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = stories.user_id 
        AND profiles.privacy_mode = 'public'
      )
    )
    OR (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = stories.user_id 
        AND profiles.privacy_mode = 'private'
      ) 
      AND EXISTS (
        SELECT 1 FROM follows 
        WHERE follows.following_id = stories.user_id 
        AND follows.follower_id = auth.uid()
      )
    )
    OR (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = stories.user_id 
        AND profiles.privacy_mode = 'secure'
      )
    )
  )
);

CREATE POLICY "Users can update their own stories" 
ON public.stories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
ON public.stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create story interactions table for polls, questions, etc.
CREATE TABLE public.story_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'poll', 'question', 'sticker', 'location'
  interaction_data JSONB NOT NULL, -- Flexible data structure for different interaction types
  position_x FLOAT DEFAULT 0.5, -- Position on story (0-1)
  position_y FLOAT DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for story interactions
ALTER TABLE public.story_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can add interactions to their stories" 
ON public.story_interactions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = story_id 
    AND stories.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view interactions on visible stories" 
ON public.story_interactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = story_id 
    AND (
      auth.uid() = stories.user_id 
      OR has_role(auth.uid(), 'admin'::app_role)
      OR (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = stories.user_id 
          AND profiles.privacy_mode = 'public'
        )
      )
      OR (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = stories.user_id 
          AND profiles.privacy_mode = 'private'
        ) 
        AND EXISTS (
          SELECT 1 FROM follows 
          WHERE follows.following_id = stories.user_id 
          AND follows.follower_id = auth.uid()
        )
      )
      OR (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = stories.user_id 
          AND profiles.privacy_mode = 'secure'
        )
      )
    )
  )
);

-- Create story responses table for poll answers, question replies
CREATE TABLE public.story_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interaction_id UUID NOT NULL REFERENCES public.story_interactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(interaction_id, user_id) -- One response per user per interaction
);

-- Enable RLS for story responses
ALTER TABLE public.story_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can respond to interactions" 
ON public.story_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Story owners can view all responses to their stories" 
ON public.story_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.story_interactions si
    JOIN public.stories s ON si.story_id = s.id
    WHERE si.id = interaction_id 
    AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own responses" 
ON public.story_responses 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create story views table to track who viewed stories
CREATE TABLE public.story_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Enable RLS for story views
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can record story views" 
ON public.story_views 
FOR INSERT 
WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "Story owners can view who viewed their stories" 
ON public.story_views 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = story_id 
    AND stories.user_id = auth.uid()
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_stories_updated_at
BEFORE UPDATE ON public.stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_stories_user_id_created_at ON public.stories(user_id, created_at DESC);
CREATE INDEX idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX idx_story_views_story_id ON public.story_views(story_id);
CREATE INDEX idx_story_interactions_story_id ON public.story_interactions(story_id);