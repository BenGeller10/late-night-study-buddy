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
'Pre-med student passionate about biology and chemistry. Let''s ace those science classes! 🔬', 'Biology', 'UCLA', 3, 2025, true, 3.95, true, true, true, 'tutor', 31, 19,
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