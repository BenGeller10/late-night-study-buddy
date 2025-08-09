-- Insert sample tutor subjects to make booking functional
-- First, let's get some tutors and subjects to create connections

-- Create some tutor-subject relationships with hourly rates
INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate)
SELECT 
  p.user_id,
  s.id,
  CASE 
    WHEN s.code LIKE 'MATH%' THEN 30.00
    WHEN s.code LIKE 'CHEM%' THEN 35.00
    WHEN s.code LIKE 'PHYS%' THEN 32.00
    WHEN s.code LIKE 'CS%' THEN 40.00
    ELSE 25.00
  END as hourly_rate
FROM public.profiles p
CROSS JOIN public.subjects s
WHERE p.is_tutor = true
  AND NOT EXISTS (
    SELECT 1 FROM public.tutor_subjects ts 
    WHERE ts.tutor_id = p.user_id AND ts.subject_id = s.id
  )
LIMIT 50; -- Limit to prevent too many combinations

-- If no tutors exist, create a sample tutor for testing
DO $$
DECLARE
  tutor_count INTEGER;
  sample_user_id UUID;
  subject_record RECORD;
BEGIN
  -- Check if we have any tutors
  SELECT COUNT(*) INTO tutor_count FROM public.profiles WHERE is_tutor = true;
  
  -- If no tutors exist, we need to create a sample one for testing
  IF tutor_count = 0 THEN
    -- Generate a sample user ID
    sample_user_id := gen_random_uuid();
    
    -- Insert a sample tutor profile
    INSERT INTO public.profiles (
      user_id,
      display_name,
      avatar_url,
      is_tutor,
      bio,
      gpa,
      major,
      campus,
      experience
    ) VALUES (
      sample_user_id,
      'Sarah Johnson',
      '/placeholder.svg',
      true,
      'Math and Chemistry tutor with 3 years of experience helping students succeed.',
      3.8,
      'Chemical Engineering',
      'University Campus',
      'Experienced tutor specializing in calculus and organic chemistry'
    );
    
    -- Add subjects for this sample tutor
    FOR subject_record IN SELECT id, code FROM public.subjects LOOP
      INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate)
      VALUES (
        sample_user_id,
        subject_record.id,
        CASE 
          WHEN subject_record.code LIKE 'MATH%' THEN 30.00
          WHEN subject_record.code LIKE 'CHEM%' THEN 35.00
          ELSE 25.00
        END
      );
    END LOOP;
    
    RAISE NOTICE 'Created sample tutor with subjects for testing booking functionality';
  END IF;
END $$;