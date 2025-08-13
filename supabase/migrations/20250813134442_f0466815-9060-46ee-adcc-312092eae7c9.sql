-- First insert sample subjects if they don't exist
INSERT INTO subjects (id, name, code) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Mathematics', 'MATH'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Computer Science', 'CS'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Physics', 'PHYS'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Chemistry', 'CHEM'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Biology', 'BIO'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Economics', 'ECON'),
  ('550e8400-e29b-41d4-a716-446655440007', 'English Literature', 'ENG'),
  ('550e8400-e29b-41d4-a716-446655440008', 'History', 'HIST')
ON CONFLICT (id) DO NOTHING;

-- Update existing profiles to be tutors with sample data
UPDATE profiles 
SET 
  is_tutor = true,
  display_name = CASE 
    WHEN display_name IS NULL OR display_name = '' THEN 'Sample Tutor'
    ELSE display_name
  END,
  bio = 'Experienced tutor ready to help students succeed. I have extensive knowledge in my subject areas and love making complex topics easy to understand.',
  major = 'Mathematics',
  campus = 'Stanford University',
  year = 3,
  graduation_year = 2025,
  experience = 'Experienced tutor with strong academic background and passion for teaching.',
  avatar_url = CASE 
    WHEN avatar_url IS NULL OR avatar_url = '' THEN 'https://images.unsplash.com/photo-1494790108755-2616b332c0a6?w=150&h=150&fit=crop&crop=face'
    ELSE avatar_url
  END
WHERE id IN (
  SELECT id FROM profiles 
  WHERE is_tutor IS NOT TRUE 
  LIMIT 6
);

-- Insert tutor-subject relationships for existing tutor profiles
INSERT INTO tutor_subjects (tutor_id, subject_id, hourly_rate)
SELECT 
  p.user_id,
  s.id,
  35.00 + (RANDOM() * 20)::numeric(5,2) -- Random rate between $35-55
FROM profiles p
CROSS JOIN subjects s
WHERE p.is_tutor = true
AND NOT EXISTS (
  SELECT 1 FROM tutor_subjects ts 
  WHERE ts.tutor_id = p.user_id AND ts.subject_id = s.id
)
LIMIT 20; -- Limit to avoid too many combinations