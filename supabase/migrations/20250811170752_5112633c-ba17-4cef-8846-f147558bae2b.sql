-- Fix security vulnerability: Restrict profile visibility to authenticated users only
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new secure policy that requires authentication to view profiles
CREATE POLICY "Profiles are viewable by authenticated users only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Optional: Create a more granular policy for users to view their own profiles
-- This ensures users can always see their own data
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);