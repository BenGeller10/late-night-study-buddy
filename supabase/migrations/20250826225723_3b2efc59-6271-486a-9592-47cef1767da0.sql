-- Add comprehensive sample data for Campus Connect demo

-- First, let's add some demo subjects
INSERT INTO subjects (name, code) VALUES
('Computer Science', 'CS'),
('Mathematics', 'MATH'),
('Physics', 'PHYS'),
('Chemistry', 'CHEM'),
('Biology', 'BIO'),
('English', 'ENG'),
('Economics', 'ECON'),
('Psychology', 'PSYC'),
('Statistics', 'STAT'),
('Business', 'BUS'),
('Engineering', 'ENGR'),
('History', 'HIST')
ON CONFLICT (code) DO NOTHING;

-- Add demo user profiles (these will be created when users sign up, but we're adding sample data)
-- Note: In production, these would be created through the auth system
INSERT INTO profiles (
  user_id, 
  username, 
  display_name, 
  avatar_url, 
  bio, 
  major, 
  campus, 
  year, 
  graduation_year, 
  is_tutor, 
  gpa,
  show_gpa,
  onboarding_completed,
  study_preferences_completed,
  role_preference,
  followers_count,
  following_count,
  study_preferences,
  personality_traits
) VALUES
-- Demo Tutor 1: Sarah Chen (Computer Science)
('11111111-1111-1111-1111-111111111111', 'sarahc_cs', 'Sarah Chen', 'https://images.unsplash.com/photo-1494790108755-2616b612b1f1?w=150&h=150&fit=crop&crop=face', 
'CS major who loves helping with algorithms and data structures! 🧠✨', 'Computer Science', 'UC Berkeley', 3, 2025, true, 3.9, true, true, true, 'tutor', 42, 28,
'{"study_environment": "quiet_library", "collaboration_preference": "group_sessions", "learning_style": "visual"}',
'{"study_time": "morning", "study_style": "hands_on", "work_style": "group_pro", "stress_relief": "hit_the_gym"}'),

-- Demo Tutor 2: Marcus Johnson (Mathematics)
('22222222-2222-2222-2222-222222222222', 'marcus_math', 'Marcus Johnson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
'Math tutor specializing in calculus and linear algebra. Patient and thorough! 📐', 'Mathematics', 'Stanford University', 4, 2024, true, 3.8, true, true, true, 'tutor', 38, 22,
'{"study_environment": "coffee_shop", "collaboration_preference": "one_on_one", "learning_style": "step_by_step"}',
'{"study_time": "afternoon", "study_style": "visual", "work_style": "solo_warrior", "stress_relief": "take_naps"}'),

-- Demo Tutor 3: Emma Rodriguez (Biology)
('33333333-3333-3333-3333-333333333333', 'emma_bio', 'Emma Rodriguez', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
'Pre-med student passionate about biology and chemistry. Let\'s ace those science classes! 🔬', 'Biology', 'UCLA', 3, 2025, true, 3.95, true, true, true, 'tutor', 31, 19,
'{"study_environment": "study_room", "collaboration_preference": "small_groups", "learning_style": "hands_on"}',
'{"study_time": "night", "study_style": "discussion", "work_style": "mix_both", "stress_relief": "call_friends"}'),

-- Demo Tutor 4: Alex Kim (Physics)
('44444444-4444-4444-4444-444444444444', 'alex_physics', 'Alex Kim', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
'Physics PhD student. Making complex concepts simple and fun! ⚛️', 'Physics', 'MIT', 5, 2024, true, 3.87, true, true, true, 'tutor', 45, 31,
'{"study_environment": "lab", "collaboration_preference": "interactive_sessions", "learning_style": "conceptual"}',
'{"study_time": "morning", "study_style": "visual", "work_style": "group_pro", "stress_relief": "binge_netflix"}'),

-- Demo Student 1: Jamie Thompson
('55555555-5555-5555-5555-555555555555', 'jamie_t', 'Jamie Thompson', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
'Sophomore studying business, always looking to improve my math skills! 📊', 'Business Administration', 'UC Berkeley', 2, 2026, false, 3.4, false, true, true, 'student', 15, 23,
'{"study_environment": "library", "collaboration_preference": "study_groups", "learning_style": "practice"}',
'{"study_time": "afternoon", "study_style": "discussion", "work_style": "group_pro", "stress_relief": "hit_the_gym"}'),

-- Demo Student 2: Riley Park
('66666666-6666-6666-6666-666666666666', 'riley_p', 'Riley Park', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
'CS freshman who needs help with calculus and physics 🤓', 'Computer Science', 'Stanford University', 1, 2027, false, 3.2, false, true, true, 'student', 8, 17,
'{"study_environment": "dorm", "collaboration_preference": "one_on_one", "learning_style": "visual"}',
'{"study_time": "night", "study_style": "solo", "work_style": "solo_warrior", "stress_relief": "take_naps"}')

ON CONFLICT (user_id) DO NOTHING;

-- Add tutor subjects with hourly rates
INSERT INTO tutor_subjects (tutor_id, subject_id, hourly_rate)
SELECT 
  p.user_id,
  s.id,
  CASE 
    WHEN p.username = 'sarahc_cs' AND s.code IN ('CS', 'MATH') THEN 45.00
    WHEN p.username = 'marcus_math' AND s.code IN ('MATH', 'STAT') THEN 42.00
    WHEN p.username = 'emma_bio' AND s.code IN ('BIO', 'CHEM') THEN 40.00
    WHEN p.username = 'alex_physics' AND s.code IN ('PHYS', 'MATH') THEN 50.00
    ELSE NULL
  END as hourly_rate
FROM profiles p
CROSS JOIN subjects s
WHERE p.is_tutor = true
  AND (
    (p.username = 'sarahc_cs' AND s.code IN ('CS', 'MATH')) OR
    (p.username = 'marcus_math' AND s.code IN ('MATH', 'STAT')) OR
    (p.username = 'emma_bio' AND s.code IN ('BIO', 'CHEM')) OR
    (p.username = 'alex_physics' AND s.code IN ('PHYS', 'MATH'))
  )
ON CONFLICT (tutor_id, subject_id) DO NOTHING;

-- Add some campus posts and stories
INSERT INTO campus_posts (user_id, content, post_type, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Just finished helping 3 students with their CS homework today! Feeling grateful to be part of this amazing community 🧠💫', 'post', now() - interval '2 hours'),
('22222222-2222-2222-2222-222222222222', 'Pro tip: When studying calculus, always start with the fundamentals. Master your derivatives before moving to integrals! 📐', 'tip', now() - interval '5 hours'),
('33333333-3333-3333-3333-333333333333', 'Lab day was intense but so rewarding! Love seeing students have those "aha!" moments in biology 🔬✨', 'post', now() - interval '1 day'),
('55555555-5555-5555-5555-555555555555', 'Finally understanding linear algebra thanks to Marcus! This campus tutoring program is a game changer 🙌', 'post', now() - interval '3 hours'),
('66666666-6666-6666-6666-666666666666', 'Study group forming for CS 101 midterm - who\'s in? Let\'s crush this together! 💪', 'study_group', now() - interval '6 hours')
ON CONFLICT (id) DO NOTHING;

-- Add campus stories (24-hour expiring content)
INSERT INTO campus_stories (user_id, content, expires_at, view_count) VALUES
('11111111-1111-1111-1111-111111111111', 'Currently: Explaining recursion with pizza analogies 🍕➰', now() + interval '22 hours', 15),
('22222222-2222-2222-2222-222222222222', 'Math problem of the day: Can you solve this integral? 🤔', now() + interval '20 hours', 23),
('33333333-3333-3333-3333-333333333333', 'Lab prep mode activated! 🥽⚗️', now() + interval '18 hours', 31),
('44444444-4444-4444-4444-444444444444', 'Physics fact: Did you know light can behave as both a wave and particle? 🌊⚛️', now() + interval '16 hours', 42),
('55555555-5555-5555-5555-555555555555', 'Cramming for business ethics exam 📚☕', now() + interval '14 hours', 8),
('66666666-6666-6666-6666-666666666666', 'Debugging life, one line at a time 💻🐛', now() + interval '12 hours', 12)
ON CONFLICT (id) DO NOTHING;

-- Add some sample conversations between students and tutors
INSERT INTO conversations (participant1_id, participant2_id, status, created_at, last_message_at) VALUES
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'accepted', now() - interval '2 days', now() - interval '1 hour'),
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'accepted', now() - interval '1 day', now() - interval '30 minutes'),
('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'pending', now() - interval '3 hours', now() - interval '3 hours')
ON CONFLICT (id) DO NOTHING;

-- Add sample messages
INSERT INTO messages (conversation_id, sender_id, content, created_at)
SELECT 
  c.id,
  CASE 
    WHEN c.participant1_id = '55555555-5555-5555-5555-555555555555' AND c.participant2_id = '22222222-2222-2222-2222-222222222222' THEN '55555555-5555-5555-5555-555555555555'
    WHEN c.participant1_id = '66666666-6666-6666-6666-666666666666' AND c.participant2_id = '11111111-1111-1111-1111-111111111111' THEN '66666666-6666-6666-6666-666666666666'
    ELSE c.participant1_id
  END,
  CASE 
    WHEN c.participant1_id = '55555555-5555-5555-5555-555555555555' AND c.participant2_id = '22222222-2222-2222-2222-222222222222' THEN 'Hi Marcus! I saw your profile and I really need help with calculus. Are you available this week?'
    WHEN c.participant1_id = '66666666-6666-6666-6666-666666666666' AND c.participant2_id = '11111111-1111-1111-1111-111111111111' THEN 'Hey Sarah! I\'m struggling with data structures in CS 101. Could you help me understand binary trees?'
    ELSE 'Hello! I need help with biology concepts for my upcoming exam.'
  END,
  CASE 
    WHEN c.participant1_id = '55555555-5555-5555-5555-555555555555' AND c.participant2_id = '22222222-2222-2222-2222-222222222222' THEN now() - interval '2 hours'
    WHEN c.participant1_id = '66666666-6666-6666-6666-666666666666' AND c.participant2_id = '11111111-1111-1111-1111-111111111111' THEN now() - interval '45 minutes'
    ELSE now() - interval '3 hours'
  END
FROM conversations c
WHERE c.status IN ('accepted', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Add tutor responses
INSERT INTO messages (conversation_id, sender_id, content, created_at)
SELECT 
  c.id,
  c.participant2_id,
  CASE 
    WHEN c.participant2_id = '22222222-2222-2222-2222-222222222222' THEN 'Absolutely! I\'d love to help you with calculus. I have availability Tuesday and Thursday evenings. What specific topics are you working on?'
    WHEN c.participant2_id = '11111111-1111-1111-1111-111111111111' THEN 'Hi Riley! Binary trees can be tricky at first, but once you get the concept they\'re actually quite elegant. I\'m free tomorrow afternoon if you want to meet up!'
    ELSE 'I\'d be happy to help! Let me know what specific topics you need assistance with.'
  END,
  CASE 
    WHEN c.participant2_id = '22222222-2222-2222-2222-222222222222' THEN now() - interval '1 hour'
    WHEN c.participant2_id = '11111111-1111-1111-1111-111111111111' THEN now() - interval '30 minutes'
    ELSE now() - interval '2 hours'
  END
FROM conversations c
WHERE c.status = 'accepted'
ON CONFLICT (id) DO NOTHING;

-- Add some sample sessions (tutoring bookings)
INSERT INTO sessions (student_id, tutor_id, subject_id, scheduled_at, duration_minutes, total_amount, status, payment_status, location, notes)
SELECT 
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  s.id,
  now() + interval '2 days' + interval '2 hours',
  60,
  42.00,
  'confirmed',
  'completed',
  'Main Library - Study Room 203',
  'Focus on derivatives and chain rule'
FROM subjects s WHERE s.code = 'MATH'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sessions (student_id, tutor_id, subject_id, scheduled_at, duration_minutes, total_amount, status, payment_status, location, notes)
SELECT 
  '66666666-6666-6666-6666-666666666666',
  '11111111-1111-1111-1111-111111111111',
  s.id,
  now() + interval '1 day' + interval '3 hours',
  90,
  67.50,
  'confirmed',
  'completed',
  'Virtual (Zoom)',
  'Binary trees, traversal algorithms, and implementation in Python'
FROM subjects s WHERE s.code = 'CS'
ON CONFLICT (id) DO NOTHING;

-- Add some user follows to create social connections
INSERT INTO user_follows (follower_id, following_id) VALUES
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222'),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111'),
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111'),
('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333'),
('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- Update follower/following counts
UPDATE profiles SET 
  followers_count = (
    SELECT COUNT(*) FROM user_follows WHERE following_id = profiles.user_id
  ),
  following_count = (
    SELECT COUNT(*) FROM user_follows WHERE follower_id = profiles.user_id
  )
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222', 
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);