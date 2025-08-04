-- Add schedule_data field to profiles table for storing user schedule information
ALTER TABLE public.profiles 
ADD COLUMN schedule_data TEXT;