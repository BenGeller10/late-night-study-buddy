-- Add venmo_handle to profiles table for tutors
ALTER TABLE public.profiles ADD COLUMN venmo_handle TEXT;

-- Update sessions table to include more booking details
ALTER TABLE public.sessions ADD COLUMN location TEXT;
ALTER TABLE public.sessions ADD COLUMN notes TEXT;
ALTER TABLE public.sessions ADD COLUMN payment_method TEXT DEFAULT 'venmo';
ALTER TABLE public.sessions ADD COLUMN payment_status TEXT DEFAULT 'pending';

-- Update default session status to be more descriptive
ALTER TABLE public.sessions ALTER COLUMN status SET DEFAULT 'pending_payment';