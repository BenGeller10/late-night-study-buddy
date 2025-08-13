-- Insert sample subjects
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

-- Insert sample tutor profiles
INSERT INTO profiles (
  id, user_id, display_name, avatar_url, bio, is_tutor, major, 
  campus, year, graduation_year, experience, onboarding_completed
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440010',
    'Sarah Chen',
    'https://images.unsplash.com/photo-1494790108755-2616b332c0a6?w=150&h=150&fit=crop&crop=face',
    'Mathematics PhD student with 5+ years of tutoring experience. I specialize in calculus, linear algebra, and statistics. I love helping students break down complex problems into manageable steps.',
    true,
    'Mathematics',
    'Stanford University',
    5,
    2024,
    'PhD student in Applied Mathematics with 5+ years of tutoring experience. Published researcher in computational mathematics.',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440011',
    'Alex Rodriguez',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'Computer Science senior with internship experience at Google. I can help with programming fundamentals, data structures, algorithms, and web development.',
    true,
    'Computer Science',
    'Stanford University',
    4,
    2024,
    'CS senior with internship at Google. Strong background in algorithms, data structures, and full-stack development.',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440012',
    'Emily Johnson',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'Physics major with a passion for making complex concepts accessible. I tutor intro physics, mechanics, and electromagnetism with real-world examples.',
    true,
    'Physics',
    'Stanford University',
    3,
    2025,
    'Junior in Physics with excellent grades and teaching assistant experience for introductory physics courses.',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440013',
    'Marcus Thompson',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'Pre-med student excelling in chemistry and biology. I help students with organic chemistry, general chemistry, and biology fundamentals.',
    true,
    'Biology',
    'Stanford University',
    3,
    2025,
    'Pre-med junior with excellent performance in chemistry and biology courses. Experienced in laboratory techniques.',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440014',
    'Sophia Kim',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    'Economics major with strong analytical skills. I tutor microeconomics, macroeconomics, and statistics with practical applications.',
    true,
    'Economics',
    'Stanford University',
    4,
    2024,
    'Senior in Economics with high honors. Experienced in econometrics and financial modeling.',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440015',
    '550e8400-e29b-41d4-a716-446655440015',
    'David Park',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    'English Literature PhD candidate specializing in creative writing and literary analysis. I help with essay writing, reading comprehension, and critical thinking.',
    true,
    'English Literature',
    'Stanford University',
    6,
    2024,
    'PhD candidate in English Literature with published poetry and extensive teaching experience.',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Insert tutor-subject relationships with hourly rates
INSERT INTO tutor_subjects (id, tutor_id, subject_id, hourly_rate) VALUES
  -- Sarah Chen - Math subjects
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 45.00),
  
  -- Alex Rodriguez - CS subjects
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 50.00),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 40.00),
  
  -- Emily Johnson - Physics and Math
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 42.00),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 38.00),
  
  -- Marcus Thompson - Biology and Chemistry
  ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440005', 40.00),
  ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 42.00),
  
  -- Sophia Kim - Economics and Math
  ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440006', 45.00),
  ('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 35.00),
  
  -- David Park - English and History
  ('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440007', 48.00),
  ('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440008', 40.00)
ON CONFLICT (id) DO NOTHING;