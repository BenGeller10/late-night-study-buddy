-- Fix RLS policies for user privacy and security

-- 1. Restrict user_follows table - only show connections where user is involved
DROP POLICY IF EXISTS "Anyone can view follows" ON public.user_follows;
CREATE POLICY "Users can view their own follows and followers" 
ON public.user_follows 
FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- 2. Restrict user_badges table - only show user's own badges
DROP POLICY IF EXISTS "Anyone can view badges" ON public.user_badges;
CREATE POLICY "Users can view their own badges" 
ON public.user_badges 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Keep tutor_subjects readable for discovery but ensure it's intentional
-- This table should remain public for tutor discovery functionality
-- Users need to see available tutors and their subjects/rates
-- This is intentional for the business model

-- Grant necessary permissions
GRANT SELECT ON public.user_follows TO authenticated;
GRANT SELECT ON public.user_badges TO authenticated;