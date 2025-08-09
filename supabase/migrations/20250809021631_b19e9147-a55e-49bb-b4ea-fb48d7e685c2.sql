-- Add new columns to profiles if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS role_preference text DEFAULT 'student',
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS study_preferences_completed boolean DEFAULT false;

-- Add unique constraint for username if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_key') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Add check constraint for role preference if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_preference_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_preference_check CHECK (role_preference IN ('student', 'tutor', 'both'));
    END IF;
END $$;

-- Create campus_stories table for 24-hour stories
CREATE TABLE IF NOT EXISTS public.campus_stories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamp with time zone DEFAULT now(),
  view_count integer DEFAULT 0
);

-- Enable RLS on campus_stories
ALTER TABLE public.campus_stories ENABLE ROW LEVEL SECURITY;

-- Create policies for campus_stories
DROP POLICY IF EXISTS "Users can create their own stories" ON public.campus_stories;
CREATE POLICY "Users can create their own stories" 
ON public.campus_stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view unexpired stories" ON public.campus_stories;
CREATE POLICY "Users can view unexpired stories" 
ON public.campus_stories 
FOR SELECT 
USING (expires_at > now());

DROP POLICY IF EXISTS "Users can update their own stories" ON public.campus_stories;
CREATE POLICY "Users can update their own stories" 
ON public.campus_stories 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own stories" ON public.campus_stories;
CREATE POLICY "Users can delete their own stories" 
ON public.campus_stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create story_views table to track who viewed stories
CREATE TABLE IF NOT EXISTS public.story_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id uuid NOT NULL REFERENCES public.campus_stories(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Enable RLS on story_views
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Create policies for story_views
DROP POLICY IF EXISTS "Users can track their story views" ON public.story_views;
CREATE POLICY "Users can track their story views" 
ON public.story_views 
FOR INSERT 
WITH CHECK (auth.uid() = viewer_id);

DROP POLICY IF EXISTS "Story owners can see who viewed their stories" ON public.story_views;
CREATE POLICY "Story owners can see who viewed their stories" 
ON public.story_views 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.campus_stories 
    WHERE id = story_views.story_id AND user_id = auth.uid()
  ) OR auth.uid() = viewer_id
);

-- Create user_preferences table for AI personalization
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  study_schedule text, -- 'night_owl', 'early_riser', 'flexible'
  study_environment text, -- 'silent', 'background_music', 'collaborative'
  learning_style text, -- 'visual', 'auditory', 'kinesthetic', 'reading'
  collaboration_preference text, -- 'group_study', 'one_on_one', 'independent'
  academic_goals jsonb DEFAULT '{}',
  stress_management jsonb DEFAULT '{}',
  favorite_subjects jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences
DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage their own preferences" 
ON public.user_preferences 
FOR ALL 
USING (auth.uid() = user_id);