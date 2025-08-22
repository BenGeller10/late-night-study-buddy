-- Create some demo tutor profiles for testing messaging functionality
-- Fix username length to meet constraint requirements

INSERT INTO profiles (
  user_id, 
  display_name, 
  username,
  avatar_url, 
  is_tutor,
  bio,
  major,
  gpa,
  show_gpa,
  onboarding_completed
) VALUES 
  (
    gen_random_uuid(), 
    'Sarah Johnson',
    'sarah_johnson',
    '',
    true,
    'Math tutor with 3+ years experience. Specializing in Calculus and Statistics.',
    'Mathematics',
    3.8,
    true,
    true
  ),
  (
    gen_random_uuid(),
    'Michael Chen',
    'michael_chen',
    '',
    true, 
    'Computer Science tutor. Expert in Python, Java, and Data Structures.',
    'Computer Science',
    3.9,
    true,
    true
  ),
  (
    gen_random_uuid(),
    'Emma Davis',
    'emma_davis',
    '',
    true,
    'Biology and Chemistry tutor. Pre-med student with strong science background.',
    'Biology',
    3.7,
    true,
    true
  )
ON CONFLICT (user_id) DO NOTHING;