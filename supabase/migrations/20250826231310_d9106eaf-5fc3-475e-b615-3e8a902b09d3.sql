-- Insert mock tutor profiles
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data) VALUES
  ('11111111-1111-1111-1111-111111111111', 'sarah.math@example.com', '$2a$10$abcd1234', NOW(), NOW(), NOW(), '{"full_name": "Sarah Chen", "is_tutor": true, "avatar_url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"}'),
  ('22222222-2222-2222-2222-222222222222', 'mike.cs@example.com', '$2a$10$abcd1234', NOW(), NOW(), NOW(), '{"full_name": "Mike Johnson", "is_tutor": true, "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}'),
  ('33333333-3333-3333-3333-333333333333', 'jessica.bio@example.com', '$2a$10$abcd1234', NOW(), NOW(), NOW(), '{"full_name": "Jessica Park", "is_tutor": true, "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"}'),
  ('44444444-4444-4444-4444-444444444444', 'alex.student@example.com', '$2a$10$abcd1234', NOW(), NOW(), NOW(), '{"full_name": "Alex Rivera", "is_tutor": false, "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}'),
  ('55555555-5555-5555-5555-555555555555', 'emma.student@example.com', '$2a$10$abcd1234', NOW(), NOW(), NOW(), '{"full_name": "Emma Thompson", "is_tutor": false, "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"}')
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding profiles
INSERT INTO profiles (user_id, display_name, avatar_url, bio, is_tutor, campus, major, year, gpa, graduation_year, experience, venmo_handle) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sarah Chen', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'Math PhD student with 3+ years tutoring experience. I love helping students overcome math anxiety!', true, 'Syracuse University', 'Mathematics', 5, 3.9, 2025, 'Teaching calculus and statistics for 3 years. Former math teacher.', '@sarah-math'),
  ('22222222-2222-2222-2222-222222222222', 'Mike Johnson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Computer Science senior specializing in algorithms and data structures. Patient and detail-oriented tutor.', true, 'Syracuse University', 'Computer Science', 4, 3.8, 2025, 'Software engineering intern at major tech company. Tutoring CS courses for 2 years.', '@mike-codes'),
  ('33333333-3333-3333-3333-333333333333', 'Jessica Park', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'Biology major passionate about helping pre-med students succeed. Clear explanations and exam prep specialist.', true, 'Syracuse University', 'Biology', 3, 3.95, 2026, 'Pre-med track student. Research experience in molecular biology lab.', '@jess-bio'),
  ('44444444-4444-4444-4444-444444444444', 'Alex Rivera', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Engineering student always looking to improve my math and physics skills.', false, 'Syracuse University', 'Mechanical Engineering', 2, 3.4, 2027, '', '@alex-eng'),
  ('55555555-5555-5555-5555-555555555555', 'Emma Thompson', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', 'Business student seeking help with statistics and economics courses.', false, 'Syracuse University', 'Business Administration', 3, 3.6, 2026, '', '@emma-biz')
ON CONFLICT (user_id) DO NOTHING;

-- Get subject IDs for tutoring associations
WITH subject_ids AS (
  SELECT id, name FROM subjects WHERE name IN ('Calculus I', 'Statistics', 'Computer Science', 'Biology', 'Organic Chemistry', 'Physics I', 'Linear Algebra', 'Data Structures')
)
-- Insert tutor-subject associations
INSERT INTO tutor_subjects (tutor_id, subject_id, hourly_rate) 
SELECT 
  '11111111-1111-1111-1111-111111111111',
  s.id,
  CASE 
    WHEN s.name IN ('Calculus I', 'Statistics', 'Linear Algebra') THEN 45
    ELSE 40
  END
FROM subject_ids s WHERE s.name IN ('Calculus I', 'Statistics', 'Linear Algebra')
UNION ALL
SELECT 
  '22222222-2222-2222-2222-222222222222',
  s.id,
  CASE 
    WHEN s.name = 'Data Structures' THEN 55
    ELSE 50
  END
FROM subject_ids s WHERE s.name IN ('Computer Science', 'Data Structures')
UNION ALL
SELECT 
  '33333333-3333-3333-3333-333333333333',
  s.id,
  CASE 
    WHEN s.name = 'Organic Chemistry' THEN 50
    ELSE 45
  END
FROM subject_ids s WHERE s.name IN ('Biology', 'Organic Chemistry')
ON CONFLICT DO NOTHING;