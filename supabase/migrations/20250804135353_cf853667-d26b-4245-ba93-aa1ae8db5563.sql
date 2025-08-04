-- Update profiles table to ensure bio exists and add experience field if needed
-- Note: bio already exists in the profiles table, so we just need to add experience

DO $$ 
BEGIN
    -- Add experience column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'experience'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN experience TEXT;
    END IF;
END $$;