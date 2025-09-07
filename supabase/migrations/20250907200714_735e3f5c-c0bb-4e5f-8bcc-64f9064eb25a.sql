-- Fix the overly permissive profile access by restricting to legitimate connections only

-- Drop the overly broad public profile policy
DROP POLICY IF EXISTS "Public profile info viewable by authenticated users" ON public.profiles;

-- Create a more restrictive policy that only allows profile viewing for legitimate connections
-- This replaces the broad "authenticated users can see all profiles" with connection-based access
CREATE POLICY "Profiles viewable by connected users only"
ON public.profiles FOR SELECT
USING (
  -- Users can always see their own profile
  auth.uid() = user_id
  OR
  -- Users can see profiles of people they're in conversations with
  EXISTS (
    SELECT 1 FROM conversations
    WHERE (
      (conversations.participant1_id = auth.uid() AND conversations.participant2_id = profiles.user_id)
      OR 
      (conversations.participant2_id = auth.uid() AND conversations.participant1_id = profiles.user_id)
    )
    AND conversations.status = 'accepted'
  )
  OR
  -- Users can see profiles of people they're in sessions with
  EXISTS (
    SELECT 1 FROM sessions
    WHERE (
      (sessions.student_id = auth.uid() AND sessions.tutor_id = profiles.user_id)
      OR
      (sessions.tutor_id = auth.uid() AND sessions.student_id = profiles.user_id)
    )
  )
  OR
  -- Users can see profiles of people they follow or who follow them
  EXISTS (
    SELECT 1 FROM user_follows
    WHERE (
      (user_follows.follower_id = auth.uid() AND user_follows.following_id = profiles.user_id)
      OR
      (user_follows.following_id = auth.uid() AND user_follows.follower_id = profiles.user_id)
    )
  )
);