-- Fix Security Definer View issue
-- Drop and recreate the public_profiles view without security definer
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  display_name,
  avatar_url,
  bio,
  campus,
  major,
  year,
  graduation_year,
  is_tutor,
  followers_count,
  following_count,
  created_at,
  role_preference,
  onboarding_completed,
  study_preferences_completed
FROM public.profiles;

-- Fix Function Search Path issues by recreating functions with proper search_path
CREATE OR REPLACE FUNCTION public.cleanup_old_search_queries()
RETURNS void AS $$
BEGIN
  DELETE FROM search_queries 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  p_action text,
  p_table_name text,
  p_record_id uuid,
  p_old_data jsonb,
  p_new_data jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_data, p_new_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.audit_payout_changes()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_sensitive_access('payout_requested', 'payouts', NEW.id, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_sensitive_access('payout_updated', 'payouts', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_tutor_availability(
  p_tutor_id uuid,
  p_scheduled_at timestamptz,
  p_duration_minutes integer,
  p_session_id uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for overlapping sessions
  SELECT COUNT(*)
  INTO conflict_count
  FROM public.sessions
  WHERE tutor_id = p_tutor_id
    AND status IN ('confirmed', 'pending_payment', 'in_progress')
    AND (p_session_id IS NULL OR id != p_session_id)
    AND (
      -- New session starts during existing session
      (p_scheduled_at >= scheduled_at AND p_scheduled_at < scheduled_at + INTERVAL '1 minute' * duration_minutes)
      OR
      -- New session ends during existing session  
      (p_scheduled_at + INTERVAL '1 minute' * p_duration_minutes > scheduled_at AND p_scheduled_at + INTERVAL '1 minute' * p_duration_minutes <= scheduled_at + INTERVAL '1 minute' * duration_minutes)
      OR
      -- New session completely encompasses existing session
      (p_scheduled_at <= scheduled_at AND p_scheduled_at + INTERVAL '1 minute' * p_duration_minutes >= scheduled_at + INTERVAL '1 minute' * duration_minutes)
    );
    
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.validate_session_scheduling()
RETURNS trigger AS $$
BEGIN
  -- Only check for confirmed or pending sessions
  IF NEW.status IN ('confirmed', 'pending_payment', 'in_progress') AND NEW.scheduled_at IS NOT NULL THEN
    IF NOT public.check_tutor_availability(NEW.tutor_id, NEW.scheduled_at, NEW.duration_minutes, NEW.id) THEN
      RAISE EXCEPTION 'Tutor is not available at the requested time. Please choose a different time slot.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create user profile with clean defaults
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
    study_preferences_completed,
    role_preference
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
    0, -- followers_count starts at 0
    0, -- following_count starts at 0
    false, -- onboarding not completed
    false, -- study preferences not completed  
    COALESCE(NEW.raw_user_meta_data ->> 'role_preference', 'student')
  );
  
  -- Initialize study streak at zero
  INSERT INTO public.study_streaks (user_id, current_streak, longest_streak)
  VALUES (NEW.id, 0, 0);
  
  -- Initialize user preferences with empty defaults
  INSERT INTO public.user_preferences (
    user_id,
    academic_goals,
    stress_management,
    favorite_subjects,
    study_schedule,
    study_environment,
    learning_style,
    collaboration_preference
  )
  VALUES (
    NEW.id,
    '{}'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    null,
    null,
    null,
    null
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix RLS policies to require authentication for sensitive data

-- Drop existing overly permissive policies and create secure ones
DROP POLICY IF EXISTS "Tutor subjects are viewable by everyone" ON public.tutor_subjects;
CREATE POLICY "Authenticated users can view tutor subjects"
ON public.tutor_subjects FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view all posts" ON public.campus_posts;
CREATE POLICY "Authenticated users can view campus posts"
ON public.campus_posts FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view all reactions" ON public.post_reactions;
CREATE POLICY "Authenticated users can view post reactions"
ON public.post_reactions FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "User badges are viewable by everyone" ON public.user_badges;
CREATE POLICY "Authenticated users can view user badges"
ON public.user_badges FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view all follows" ON public.user_follows;
CREATE POLICY "Authenticated users can view user follows"
ON public.user_follows FOR SELECT
USING (auth.uid() IS NOT NULL);