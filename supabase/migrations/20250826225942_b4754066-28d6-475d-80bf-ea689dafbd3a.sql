-- Add comprehensive sample data for Campus Connect demo with proper username lengths

-- First, let's add some demo subjects (skip if already exists)
INSERT INTO subjects (name, code) 
SELECT * FROM (VALUES
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
) AS v(name, code)
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE subjects.code = v.code);

-- Add demo user profiles with proper username lengths
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
) 
SELECT * FROM (VALUES
-- Demo Tutor 1: Sarah Chen (Computer Science)
('11111111-1111-1111-1111-111111111111', 'sarahc_cs2024', 'Sarah Chen', 'https://images.unsplash.com/photo-1494790108755-2616b612b1f1?w=150&h=150&fit=crop&crop=face', 
'CS major who loves helping with algorithms and data structures! 🧠✨', 'Computer Science', 'UC Berkeley', 3, 2025, true, 3.9, true, true, true, 'tutor', 2, 3,
'{"study_environment": "quiet_library", "collaboration_preference": "group_sessions", "learning_style": "visual"}',
'{"study_time": "morning", "study_style": "hands_on", "work_style": "group_pro", "stress_relief": "hit_the_gym"}'),

-- Demo Tutor 2: Marcus Johnson (Mathematics)
('22222222-2222-2222-2222-222222222222', 'marcus_math_tutor', 'Marcus Johnson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
'Math tutor specializing in calculus and linear algebra. Patient and thorough! 📐', 'Mathematics', 'Stanford University', 4, 2024, true, 3.8, true, true, true, 'tutor', 1, 2,
'{"study_environment": "coffee_shop", "collaboration_preference": "one_on_one", "learning_style": "step_by_step"}',
'{"study_time": "afternoon", "study_style": "visual", "work_style": "solo_warrior", "stress_relief": "take_naps"}'),

-- Demo Tutor 3: Emma Rodriguez (Biology)
('33333333-3333-3333-3333-333333333333', 'emma_bio_expert', 'Emma Rodriguez', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
'Pre-med student passionate about biology and chemistry. Ace those science classes! 🔬', 'Biology', 'UCLA', 3, 2025, true, 3.95, true, true, true, 'tutor', 1, 1,
'{"study_environment": "study_room", "collaboration_preference": "small_groups", "learning_style": "hands_on"}',
'{"study_time": "night", "study_style": "discussion", "work_style": "mix_both", "stress_relief": "call_friends"}'),

-- Demo Student 1: Jamie Thompson
('55555555-5555-5555-5555-555555555555', 'jamie_student2026', 'Jamie Thompson', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
'Sophomore studying business, always looking to improve my math skills! 📊', 'Business Administration', 'UC Berkeley', 2, 2026, false, 3.4, false, true, true, 'student', 0, 2,
'{"study_environment": "library", "collaboration_preference": "study_groups", "learning_style": "practice"}',
'{"study_time": "afternoon", "study_style": "discussion", "work_style": "group_pro", "stress_relief": "hit_the_gym"}'),

-- Demo Student 2: Riley Park
('66666666-6666-6666-6666-666666666666', 'riley_freshman', 'Riley Park', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
'CS freshman who needs help with calculus and physics 🤓', 'Computer Science', 'Stanford University', 1, 2027, false, 3.2, false, true, true, 'student', 0, 1,
'{"study_environment": "dorm", "collaboration_preference": "one_on_one", "learning_style": "visual"}',
'{"study_time": "night", "study_style": "solo", "work_style": "solo_warrior", "stress_relief": "take_naps"}')
) AS v
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = v.user_id);