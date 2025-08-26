-- Add comprehensive sample data for Campus Connect demo

-- Add demo subjects only if they don't exist
INSERT INTO subjects (name, code) 
VALUES 
('Computer Science', 'CS'),
('Mathematics', 'MATH'),
('Physics', 'PHYS'),
('Chemistry', 'CHEM'),
('Biology', 'BIO')
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE code IN ('CS', 'MATH', 'PHYS', 'CHEM', 'BIO'));

-- Add demo user profiles (checking each individually)
DO $$
BEGIN
  -- Demo Tutor 1: Sarah Chen (Computer Science)
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = '11111111-1111-1111-1111-111111111111') THEN
    INSERT INTO profiles (user_id, username, display_name, avatar_url, bio, major, campus, year, graduation_year, is_tutor, gpa, show_gpa, onboarding_completed, study_preferences_completed, role_preference, followers_count, following_count, study_preferences, personality_traits)
    VALUES ('11111111-1111-1111-1111-111111111111', 'sarahc_cs2024', 'Sarah Chen', 'https://images.unsplash.com/photo-1494790108755-2616b612b1f1?w=150&h=150&fit=crop&crop=face', 'CS major who loves helping with algorithms and data structures! 🧠✨', 'Computer Science', 'UC Berkeley', 3, 2025, true, 3.9, true, true, true, 'tutor', 2, 3, '{"study_environment": "quiet_library"}', '{"study_time": "morning"}');
  END IF;

  -- Demo Tutor 2: Marcus Johnson (Mathematics)  
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = '22222222-2222-2222-2222-222222222222') THEN
    INSERT INTO profiles (user_id, username, display_name, avatar_url, bio, major, campus, year, graduation_year, is_tutor, gpa, show_gpa, onboarding_completed, study_preferences_completed, role_preference, followers_count, following_count, study_preferences, personality_traits)
    VALUES ('22222222-2222-2222-2222-222222222222', 'marcus_math_tutor', 'Marcus Johnson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Math tutor specializing in calculus and linear algebra. Patient and thorough! 📐', 'Mathematics', 'Stanford University', 4, 2024, true, 3.8, true, true, true, 'tutor', 1, 2, '{"study_environment": "coffee_shop"}', '{"study_time": "afternoon"}');
  END IF;

  -- Demo Student 1: Jamie Thompson
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = '55555555-5555-5555-5555-555555555555') THEN
    INSERT INTO profiles (user_id, username, display_name, avatar_url, bio, major, campus, year, graduation_year, is_tutor, gpa, show_gpa, onboarding_completed, study_preferences_completed, role_preference, followers_count, following_count, study_preferences, personality_traits)
    VALUES ('55555555-5555-5555-5555-555555555555', 'jamie_student2026', 'Jamie Thompson', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face', 'Sophomore studying business, always looking to improve my math skills! 📊', 'Business Administration', 'UC Berkeley', 2, 2026, false, 3.4, false, true, true, 'student', 0, 2, '{"study_environment": "library"}', '{"study_time": "afternoon"}');
  END IF;
END $$;