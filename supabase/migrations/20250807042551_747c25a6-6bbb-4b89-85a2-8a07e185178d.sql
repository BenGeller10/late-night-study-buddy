
-- Add username column with constraints
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add constraint for username length (8+ characters)
ALTER TABLE profiles 
ADD CONSTRAINT username_length_check CHECK (username IS NULL OR length(username) >= 8);

-- Create index for username searches
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Create table for user stories (24-hour posts)
CREATE TABLE IF NOT EXISTS user_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  view_count INTEGER DEFAULT 0
);

-- Enable RLS on user_stories
ALTER TABLE user_stories ENABLE ROW LEVEL SECURITY;

-- Create policies for user stories
CREATE POLICY "Users can create their own stories" 
  ON user_stories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all active stories" 
  ON user_stories 
  FOR SELECT 
  USING (expires_at > now());

CREATE POLICY "Users can update their own stories" 
  ON user_stories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
  ON user_stories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create table for story views
CREATE TABLE IF NOT EXISTS story_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES user_stories(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES auth.users NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Enable RLS on story_views
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Create policies for story views
CREATE POLICY "Users can create story views" 
  ON story_views 
  FOR INSERT 
  WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "Users can view story views" 
  ON story_views 
  FOR SELECT 
  USING (true);

-- Add GPA requirement constraint for tutors
ALTER TABLE profiles 
ADD CONSTRAINT tutor_gpa_requirement CHECK (
  (is_tutor = false) OR 
  (is_tutor = true AND gpa IS NOT NULL AND gpa >= 3.6)
);

-- Create function to initialize new user with clean stats
CREATE OR REPLACE FUNCTION initialize_clean_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update the existing handle_new_user function to ensure clean initialization
  UPDATE public.profiles 
  SET 
    followers_count = 0,
    following_count = 0,
    completed_intro_questions = false,
    study_preferences = '{}'::jsonb,
    personality_traits = '{}'::jsonb
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for clean user initialization
DROP TRIGGER IF EXISTS on_clean_user_init ON auth.users;
CREATE TRIGGER on_clean_user_init
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_clean_user_profile();

-- Update existing handle_new_user function to ensure clean initialization
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
    completed_intro_questions,
    study_preferences,
    personality_traits
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
    0, -- Clean start: 0 followers
    0, -- Clean start: 0 following
    false, -- Force onboarding
    '{}'::jsonb, -- Empty preferences
    '{}'::jsonb  -- Empty personality traits
  );
  
  INSERT INTO public.study_streaks (user_id, current_streak, longest_streak)
  VALUES (NEW.id, 0, 0); -- Clean start: 0 streaks
  
  RETURN NEW;
END;
$$;
