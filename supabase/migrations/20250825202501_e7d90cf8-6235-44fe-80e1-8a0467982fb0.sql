-- Fix the security definer view issue by removing it
-- The view created a security risk, so we'll use app-level filtering instead

-- Drop the problematic view
DROP VIEW IF EXISTS public.public_tutor_profiles;

-- Instead, we'll rely on RLS policies and application-level filtering
-- This is more secure than using a security definer view

-- The existing RLS policies will handle access control properly:
-- "Users can view public tutor info only" policy already restricts access appropriately