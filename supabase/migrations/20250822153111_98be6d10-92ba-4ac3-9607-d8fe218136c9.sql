-- Fix critical security vulnerability in profiles table RLS policies
-- Remove the overly permissive policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users only" ON public.profiles;

-- Keep the existing policy for users to view their own profiles
-- "Users can view their own profile" already exists

-- Add policy for legitimate profile viewing scenarios
CREATE POLICY "Users can view tutor profiles" 
ON public.profiles 
FOR SELECT 
USING (is_tutor = true);

-- Add policy for users to view profiles of people they have conversations with
CREATE POLICY "Users can view conversation participant profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE (participant1_id = auth.uid() OR participant2_id = auth.uid())
    AND (participant1_id = profiles.user_id OR participant2_id = profiles.user_id)
  )
);

-- Add policy for users to view profiles of people they have sessions with
CREATE POLICY "Users can view session participant profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM sessions 
    WHERE (student_id = auth.uid() OR tutor_id = auth.uid())
    AND (student_id = profiles.user_id OR tutor_id = profiles.user_id)
  )
);

-- Add policy for social features - users can view profiles of people they follow/are followed by
CREATE POLICY "Users can view followed user profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_follows 
    WHERE (follower_id = auth.uid() AND following_id = profiles.user_id)
    OR (following_id = auth.uid() AND follower_id = profiles.user_id)
  )
);