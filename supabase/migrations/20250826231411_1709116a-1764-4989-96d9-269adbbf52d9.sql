-- Insert tutor-subject associations with proper UUID casting
INSERT INTO tutor_subjects (tutor_id, subject_id, hourly_rate) 
SELECT 
  '11111111-1111-1111-1111-111111111111'::uuid,
  s.id,
  CASE 
    WHEN s.name IN ('Calculus I', 'Statistics', 'Linear Algebra') THEN 45
    ELSE 40
  END
FROM subjects s WHERE s.name IN ('Calculus I', 'Statistics', 'Linear Algebra')
UNION ALL
SELECT 
  '22222222-2222-2222-2222-222222222222'::uuid,
  s.id,
  CASE 
    WHEN s.name = 'Data Structures' THEN 55
    ELSE 50
  END
FROM subjects s WHERE s.name IN ('Computer Science', 'Data Structures')
UNION ALL
SELECT 
  '33333333-3333-3333-3333-333333333333'::uuid,
  s.id,
  CASE 
    WHEN s.name = 'Organic Chemistry' THEN 50
    ELSE 45
  END
FROM subjects s WHERE s.name IN ('Biology', 'Organic Chemistry')
ON CONFLICT DO NOTHING;