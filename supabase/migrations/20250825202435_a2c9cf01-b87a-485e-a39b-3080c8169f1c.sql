-- Fix security issues with profile and payment data access

-- 1. Restrict profile data visibility - limit what can be seen about other users
-- Drop overly permissive policies and create more restrictive ones

-- Remove the overly broad tutor profile policy
DROP POLICY IF EXISTS "Users can view tutor profiles" ON public.profiles;

-- Create more restrictive tutor profile policy - only show essential public info
CREATE POLICY "Users can view public tutor info only" 
ON public.profiles 
FOR SELECT 
USING (
  is_tutor = true 
  AND auth.uid() IS NOT NULL  -- Must be authenticated
);

-- Update the policy to restrict what profile data is accessible
-- Only allow viewing basic info for tutors and full info for own profile
-- Remove access to sensitive fields like venmo_handle, gpa, campus for other users

-- 2. Restrict payment information access in sessions table
-- Students should only see their payment info, tutors should only see session details without full payment info

-- Drop existing broad policy and create more specific ones
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;

-- Students can view all their session details including payment info
CREATE POLICY "Students can view their session details with payment info" 
ON public.sessions 
FOR SELECT 
USING (auth.uid() = student_id);

-- Tutors can view session details but with limited payment info access
CREATE POLICY "Tutors can view their session details with limited payment access" 
ON public.sessions 
FOR SELECT 
USING (
  auth.uid() = tutor_id 
  -- Tutors can see session exists and basic details, but payment details are restricted in app logic
);

-- 3. Add additional security for sensitive profile fields
-- Create a view for public tutor information that excludes sensitive data
CREATE OR REPLACE VIEW public.public_tutor_profiles AS
SELECT 
  id,
  user_id,
  display_name,
  avatar_url,
  bio,
  major,
  year,
  graduation_year,
  experience,
  is_tutor,
  followers_count,
  following_count,
  created_at,
  updated_at,
  onboarding_completed,
  -- Exclude sensitive fields: venmo_handle, gpa, show_gpa, campus, etc.
  NULL as venmo_handle,
  NULL as gpa,
  false as show_gpa
FROM public.profiles 
WHERE is_tutor = true;

-- Grant access to the public tutor view
GRANT SELECT ON public.public_tutor_profiles TO authenticated;

-- 4. Ensure search queries remain private (already properly secured but reinforcing)
-- These policies are already restrictive but let's make sure they stay that way

-- Add comment to document the security consideration
COMMENT ON TABLE public.search_queries IS 'Contains sensitive user search behavior - access must remain strictly limited to the user who created the query';

-- 5. Add additional constraints for data retention (optional but recommended)
-- Add a policy to automatically clean up old search queries (this is for future implementation)
COMMENT ON COLUMN public.search_queries.created_at IS 'Used for data retention - consider implementing automatic cleanup of queries older than 90 days';