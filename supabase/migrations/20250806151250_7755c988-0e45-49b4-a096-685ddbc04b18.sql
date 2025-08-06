-- Add missing AI agent question fields to profiles table
-- Check if columns exist first and add only if they don't
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'major_passion') THEN
        ALTER TABLE public.profiles ADD COLUMN major_passion TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'favorite_study_spot') THEN
        ALTER TABLE public.profiles ADD COLUMN favorite_study_spot TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'semester_goal') THEN
        ALTER TABLE public.profiles ADD COLUMN semester_goal TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stress_relief') THEN
        ALTER TABLE public.profiles ADD COLUMN stress_relief TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dream_career') THEN
        ALTER TABLE public.profiles ADD COLUMN dream_career TEXT;
    END IF;
END $$;