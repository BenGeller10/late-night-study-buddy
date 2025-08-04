-- First, let's see what the current constraint is and then modify it
-- Drop the existing constraint that's causing issues
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_tutor_venmo;

-- Create a more flexible constraint that allows role switching
-- Users can be tutors without venmo initially, but we'll handle this in the UI
ALTER TABLE public.profiles ADD CONSTRAINT check_tutor_venmo_flexible 
CHECK (
  (is_tutor = false) OR 
  (is_tutor = true AND venmo_handle IS NOT NULL AND venmo_handle != '') OR
  (is_tutor = true AND venmo_handle IS NULL) -- Allow null during role switch
);