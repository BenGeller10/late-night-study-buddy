-- Add username column and social features to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS role_preference text DEFAULT 'student' CHECK (role_preference IN ('student', 'tutor', 'both')),
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS study_preferences_completed boolean DEFAULT false;

-- Create constraint for username length (8+ characters)
ALTER TABLE public.profiles 
ADD CONSTRAINT username_length_check CHECK (username IS NULL OR length(username) >= 8);

-- Create constraint for tutor GPA requirement (3.6+)
ALTER TABLE public.profiles 
ADD CONSTRAINT tutor_gpa_check CHECK (
  (is_tutor = false) OR 
  (is_tutor = true AND gpa >= 3.6)
);

-- Create user_follows table for social features
CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Create policies for user_follows
CREATE POLICY "Users can follow others" 
ON public.user_follows 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" 
ON public.user_follows 
FOR DELETE 
USING (auth.uid() = follower_id);

CREATE POLICY "Users can view all follows" 
ON public.user_follows 
FOR SELECT 
USING (true);

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
CREATE POLICY "Users can create their own stories" 
ON public.campus_stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view unexpired stories" 
ON public.campus_stories 
FOR SELECT 
USING (expires_at > now());

CREATE POLICY "Users can update their own stories" 
ON public.campus_stories 
FOR UPDATE 
USING (auth.uid() = user_id);

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
CREATE POLICY "Users can track their story views" 
ON public.story_views 
FOR INSERT 
WITH CHECK (auth.uid() = viewer_id);

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
CREATE POLICY "Users can manage their own preferences" 
ON public.user_preferences 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger to update follower counts
CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    
    -- Increment followers count for followed user
    UPDATE public.profiles 
    SET followers_count = followers_count + 1 
    WHERE user_id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    UPDATE public.profiles 
    SET following_count = following_count - 1 
    WHERE user_id = OLD.follower_id;
    
    -- Decrement followers count for followed user
    UPDATE public.profiles 
    SET followers_count = followers_count - 1 
    WHERE user_id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for follower count updates
DROP TRIGGER IF EXISTS update_follower_counts_trigger ON public.user_follows;
CREATE TRIGGER update_follower_counts_trigger
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follower_counts();

-- Update handle_new_user function for clean initialization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    display_name, 
    avatar_url, 
    is_tutor,
    venmo_handle,
    schedule_data,
    bio,
    experience,
    followers_count,
    following_count,
    onboarding_completed,
    study_preferences_completed
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'is_tutor')::boolean, false),
    NEW.raw_user_meta_data ->> 'venmo_handle',
    NEW.raw_user_meta_data ->> 'schedule_data',
    COALESCE(NEW.raw_user_meta_data ->> 'bio', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'experience', ''),
    0, -- Start with 0 followers
    0, -- Start with 0 following
    false, -- Onboarding not completed
    false  -- Study preferences not completed
  );
  
  -- Initialize study streak with 0
  INSERT INTO public.study_streaks (user_id, current_streak, longest_streak)
  VALUES (NEW.id, 0, 0);
  
  -- Initialize user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;