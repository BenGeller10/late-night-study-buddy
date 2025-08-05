-- Add AI agent question fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN completed_intro_questions BOOLEAN DEFAULT false,
ADD COLUMN major_passion TEXT,
ADD COLUMN favorite_study_spot TEXT, 
ADD COLUMN semester_goal TEXT,
ADD COLUMN stress_relief TEXT,
ADD COLUMN dream_career TEXT;