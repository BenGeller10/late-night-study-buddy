-- Fix Security Issues by properly handling function recreation

-- Drop functions that need to be recreated with search_path
DROP FUNCTION IF EXISTS public.log_sensitive_access(text, text, uuid, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.audit_payout_changes();
DROP FUNCTION IF EXISTS public.cleanup_old_search_queries();

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

-- Recreate functions with proper search_path settings
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
  p_record_id uuid DEFAULT NULL,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL
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