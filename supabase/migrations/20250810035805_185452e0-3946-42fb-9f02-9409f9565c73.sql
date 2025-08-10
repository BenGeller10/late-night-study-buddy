-- Create tutor subjects for existing tutors to enable booking
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
  );