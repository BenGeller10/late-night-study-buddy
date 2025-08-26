-- Create comprehensive mock profiles for all tutors
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, aud, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'sarah.chen@syr.edu', '$2a$10$example_hash', now(), now(), now(), '{"full_name": "Sarah Chen"}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'marcus.johnson@syr.edu', '$2a$10$example_hash', now(), now(), now(), '{"full_name": "Marcus Johnson"}', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'emma.rodriguez@syr.edu', '$2a$10$example_hash', now(), now(), now(), '{"full_name": "Emma Rodriguez"}', 'authenticated', 'authenticated'),
  ('44444444-4444-4444-4444-444444444444', 'david.kim@syr.edu', '$2a$10$example_hash', now(), now(), now(), '{"full_name": "David Kim"}', 'authenticated', 'authenticated'),
  ('55555555-5555-5555-5555-555555555555', 'jessica.park@syr.edu', '$2a$10$example_hash', now(), now(), now(), '{"full_name": "Jessica Park"}', 'authenticated', 'authenticated'),
  ('66666666-6666-6666-6666-666666666666', 'michael.thompson@syr.edu', '$2a$10$example_hash', now(), now(), now(), '{"full_name": "Michael Thompson"}', 'authenticated', 'authenticated'),
  ('77777777-7777-7777-7777-777777777777', 'aisha.patel@syr.edu', '$2a$10$example_hash', now(), now(), now(), '{"full_name": "Aisha Patel"}', 'authenticated', 'authenticated'),
  ('88888888-8888-8888-8888-888888888888', 'ryan.mitchell@syr.edu', '$2a$10$example_hash', now(), now(), now(), '{"full_name": "Ryan Mitchell"}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Create comprehensive profiles for all tutors
INSERT INTO profiles (
  user_id, display_name, avatar_url, bio, major, campus, year, graduation_year, 
  is_tutor, gpa, show_gpa, venmo_handle, experience, onboarding_completed, 
  study_preferences_completed, followers_count, following_count, username,
  major_passion, favorite_study_spot, semester_goal, stress_relief, dream_career,
  study_preferences, personality_traits, completed_intro_questions
) VALUES 
-- Sarah Chen - Math PhD
('11111111-1111-1111-1111-111111111111', 'Sarah Chen', 'https://images.unsplash.com/photo-1494790108755-2616c367fb0c?w=400&h=400&fit=crop&crop=face', 
 'Math PhD student passionate about helping others succeed in STEM. 3 years TA experience, 127 sessions completed! 🧮✨', 
 'Mathematics PhD', 'Syracuse University', 6, 2024, true, 3.95, true, '@sarah-math-tutor', 
 'Teaching Assistant for Calculus I, II, and III. Published researcher in algebraic topology. Specializes in making complex mathematical concepts accessible.', 
 true, true, 234, 89, 'sarah_chen_math',
 'Pure mathematics and its real-world applications', 'Math library study rooms with whiteboards', 'Complete my dissertation defense', 'Rock climbing and hiking', 'Mathematics professor at a research university',
 '{"learning_style": "visual", "study_environment": "quiet", "collaboration_preference": "one_on_one", "study_schedule": "morning"}',
 '{"patience": 9, "communication": 10, "enthusiasm": 9, "reliability": 10}', true),

-- Marcus Johnson - CS grad
('22222222-2222-2222-2222-222222222222', 'Marcus Johnson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
 'CS grad student with Google & Microsoft internships. Making coding fun and accessible! 💻🚀',
 'Computer Science MS', 'Syracuse University', 5, 2024, true, 3.87, true, '@marcus-codes',
 'Software Engineer intern at major tech companies. Expert in algorithms, data structures, and full-stack development. Loves teaching programming fundamentals.',
 true, true, 189, 156, 'marcus_codes',
 'Artificial intelligence and machine learning', 'Campus coffee shops with good WiFi', 'Land a full-time offer at a FAANG company', 'Gaming and basketball', 'Senior Software Engineer at a tech unicorn',
 '{"learning_style": "hands_on", "study_environment": "collaborative", "collaboration_preference": "group", "study_schedule": "evening"}',
 '{"creativity": 8, "problem_solving": 10, "communication": 8, "adaptability": 9}', true),

-- Emma Rodriguez - Pre-med
('33333333-3333-3333-3333-333333333333', 'Emma Rodriguez', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
 'Pre-med with 4.0 GPA, MCAT 95th percentile. 156 sessions completed, perfect 5.0 rating! 🧪🧬',
 'Biology/Pre-Med', 'Syracuse University', 4, 2024, true, 4.0, true, '@emma-premed',
 'Top-performing pre-med student with extensive research experience. MCAT tutor and lab research assistant. Passionate about making science accessible.',
 true, true, 312, 201, 'emma_bio_premed',
 'Molecular biology and medical research', 'Science library with natural light', 'Get accepted to top medical schools', 'Yoga and meditation', 'Pediatric oncologist',
 '{"learning_style": "detailed", "study_environment": "quiet", "collaboration_preference": "one_on_one", "study_schedule": "all_day"}',
 '{"discipline": 10, "empathy": 10, "organization": 10, "dedication": 10}', true),

-- David Kim - Economics & Finance
('44444444-4444-4444-4444-444444444444', 'David Kim', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
 'Economics & Finance double major with Goldman Sachs internship. Real-world examples! 📈💰',
 'Economics & Finance', 'Syracuse University', 4, 2024, true, 3.82, true, '@david-econ-finance',
 'Investment banking intern with real trading floor experience. Expert in financial modeling, econometrics, and market analysis. Makes complex theories practical.',
 true, true, 167, 134, 'david_econ_wall_st',
 'Behavioral economics and market psychology', 'Business school study lounges', 'Secure full-time analyst position on Wall Street', 'Tennis and financial podcasts', 'Investment portfolio manager',
 '{"learning_style": "analytical", "study_environment": "professional", "collaboration_preference": "mixed", "study_schedule": "flexible"}',
 '{"analytical_thinking": 9, "communication": 8, "ambition": 10, "precision": 9}', true),

-- Jessica Park - Psychology PhD
('55555555-5555-5555-5555-555555555555', 'Jessica Park', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
 'Psychology PhD candidate, published researcher. Let''s decode human behavior! 🧠📊',
 'Psychology PhD', 'Syracuse University', 6, 2025, true, 3.91, true, '@jessica-psych-phd',
 'Clinical psychology researcher with publications in top-tier journals. Specializes in cognitive behavioral therapy and research methods. Patient and insightful teacher.',
 true, true, 278, 167, 'jessica_mind_matters',
 'Clinical psychology and therapeutic interventions', 'Psychology building quiet study areas', 'Defend dissertation and start clinical practice', 'Mindfulness and art therapy', 'Licensed clinical psychologist with private practice',
 '{"learning_style": "reflective", "study_environment": "calm", "collaboration_preference": "supportive", "study_schedule": "structured"}',
 '{"empathy": 10, "patience": 10, "insight": 9, "communication": 10}', true),

-- Michael Thompson - English Literature
('66666666-6666-6666-6666-666666666666', 'Michael Thompson', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
 'Published author & MFA candidate. Writing Center tutor, 112 sessions completed! ✍️📚',
 'English Literature MFA', 'Syracuse University', 5, 2024, true, 3.88, true, '@michael-writes',
 'MFA student and published fiction writer. Writing Center consultant with expertise in academic writing, creative writing, and literature analysis. Makes writing enjoyable.',
 true, true, 145, 98, 'michael_wordsmith',
 'Contemporary American literature and creative writing', 'Campus coffee shops and outdoor benches', 'Publish debut novel and graduate', 'Creative writing and hiking', 'Published novelist and college writing professor',
 '{"learning_style": "creative", "study_environment": "inspiring", "collaboration_preference": "workshop", "study_schedule": "flexible"}',
 '{"creativity": 10, "communication": 10, "inspiration": 9, "flexibility": 8}', true),

-- Aisha Patel - Chemical Engineering
('77777777-7777-7777-7777-777777777777', 'Aisha Patel', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
 'Chemical Engineering major with ExxonMobil internship. Let''s engineer your success! ⚗️🔧',
 'Chemical Engineering', 'Syracuse University', 4, 2024, true, 3.84, true, '@aisha-chem-eng',
 'Chemical engineering student with petroleum industry internship experience. Expert in process design, thermodynamics, and reaction engineering. Practical problem-solver.',
 true, true, 198, 142, 'aisha_chem_engineer',
 'Sustainable chemical processes and green engineering', 'Engineering building labs and study spaces', 'Land full-time process engineer role', 'Rock climbing and sustainable cooking', 'Lead engineer in renewable energy sector',
 '{"learning_style": "systematic", "study_environment": "technical", "collaboration_preference": "team", "study_schedule": "intensive"}',
 '{"problem_solving": 10, "precision": 9, "innovation": 8, "leadership": 8}', true),

-- Ryan Mitchell - History & Political Science
('88888888-8888-8888-8888-888888888888', 'Ryan Mitchell', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
 'History & Political Science double major with D.C. internship. Making the past come alive! 🏛️🌍',
 'History & Political Science', 'Syracuse University', 4, 2024, true, 3.76, true, '@ryan-history-poli',
 'Congressional intern with deep knowledge of American history and political systems. Excellent at connecting historical events to contemporary issues. Engaging storyteller.',
 true, true, 156, 123, 'ryan_history_buff',
 'American political history and international relations', 'Library archives and historical reading rooms', 'Get accepted to top law schools', 'Debate tournaments and political documentaries', 'Constitutional lawyer and eventually judge',
 '{"learning_style": "narrative", "study_environment": "traditional", "collaboration_preference": "discussion", "study_schedule": "evening"}',
 '{"storytelling": 9, "critical_thinking": 9, "communication": 10, "passion": 10}', true)
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  major = EXCLUDED.major,
  campus = EXCLUDED.campus,
  year = EXCLUDED.year,
  graduation_year = EXCLUDED.graduation_year,
  is_tutor = EXCLUDED.is_tutor,
  gpa = EXCLUDED.gpa,
  show_gpa = EXCLUDED.show_gpa,
  venmo_handle = EXCLUDED.venmo_handle,
  experience = EXCLUDED.experience,
  onboarding_completed = EXCLUDED.onboarding_completed,
  study_preferences_completed = EXCLUDED.study_preferences_completed,
  followers_count = EXCLUDED.followers_count,
  following_count = EXCLUDED.following_count,
  username = EXCLUDED.username,
  major_passion = EXCLUDED.major_passion,
  favorite_study_spot = EXCLUDED.favorite_study_spot,
  semester_goal = EXCLUDED.semester_goal,
  stress_relief = EXCLUDED.stress_relief,
  dream_career = EXCLUDED.dream_career,
  study_preferences = EXCLUDED.study_preferences,
  personality_traits = EXCLUDED.personality_traits,
  completed_intro_questions = EXCLUDED.completed_intro_questions;

-- Create subjects with proper UUIDs
INSERT INTO subjects (id, name, code) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Calculus I', 'MATH 295'),
  ('a2222222-2222-2222-2222-222222222222', 'Calculus II', 'MATH 296'),
  ('a3333333-3333-3333-3333-333333333333', 'General Physics I', 'PHY 211'),
  ('a4444444-4444-4444-4444-444444444444', 'Public Speaking', 'CAS 132'),
  ('b1111111-1111-1111-1111-111111111111', 'Introduction to Computer Science', 'CIS 252'),
  ('b2222222-2222-2222-2222-222222222222', 'Data Structures', 'CIS 351'),
  ('b3333333-3333-3333-3333-333333333333', 'Database Systems', 'CIS 375'),
  ('b4444444-4444-4444-4444-444444444444', 'Discrete Mathematics', 'MAT 331'),
  ('c1111111-1111-1111-1111-111111111111', 'Organic Chemistry I', 'CHE 275'),
  ('c2222222-2222-2222-2222-222222222222', 'Organic Chemistry II', 'CHE 276'),
  ('c3333333-3333-3333-3333-333333333333', 'General Biology I', 'BIO 121'),
  ('c4444444-4444-4444-4444-444444444444', 'General Biology II', 'BIO 123'),
  ('d1111111-1111-1111-1111-111111111111', 'Macroeconomics', 'ECN 203'),
  ('d2222222-2222-2222-2222-222222222222', 'Microeconomics', 'ECN 301'),
  ('d3333333-3333-3333-3333-333333333333', 'Accounting Principles', 'ACC 151'),
  ('d4444444-4444-4444-4444-444444444444', 'Corporate Finance', 'FIN 256'),
  ('e1111111-1111-1111-1111-111111111111', 'Introduction to Psychology', 'PSY 205'),
  ('e2222222-2222-2222-2222-222222222222', 'Research Methods', 'PSY 315'),
  ('e3333333-3333-3333-3333-333333333333', 'Introduction to Sociology', 'SOC 101'),
  ('e4444444-4444-4444-4444-444444444444', 'Cultural Anthropology', 'ANT 111'),
  ('f1111111-1111-1111-1111-111111111111', 'Composition I', 'ENG 105'),
  ('f2222222-2222-2222-2222-222222222222', 'Composition II', 'ENG 205'),
  ('f3333333-3333-3333-3333-333333333333', 'Studio 1', 'WRT 105'),
  ('f4444444-4444-4444-4444-444444444444', 'Studio 2', 'WRT 205'),
  ('g1111111-1111-1111-1111-111111111111', 'General Chemistry I', 'CHE 106'),
  ('g2222222-2222-2222-2222-222222222222', 'General Chemistry II', 'CHE 116'),
  ('g3333333-3333-3333-3333-333333333333', 'Physics for Non-Majors', 'PHY 101'),
  ('h1111111-1111-1111-1111-111111111111', 'World History I', 'HIS 101'),
  ('h2222222-2222-2222-2222-222222222222', 'World History II', 'HIS 111'),
  ('h3333333-3333-3333-3333-333333333333', 'Human Geography', 'GEO 155'),
  ('h4444444-4444-4444-4444-444444444444', 'American Government', 'PSC 121')
ON CONFLICT (id) DO NOTHING;

-- Link tutors to their subjects with hourly rates
INSERT INTO tutor_subjects (tutor_id, subject_id, hourly_rate) VALUES
-- Sarah Chen - Math subjects
('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 45),
('11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 45),
('11111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 42),
('11111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 35),
-- Marcus Johnson - CS subjects
('22222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 38),
('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 40),
('22222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', 42),
('22222222-2222-2222-2222-222222222222', 'b4444444-4444-4444-4444-444444444444', 35),
-- Emma Rodriguez - Science subjects
('33333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 48),
('33333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 48),
('33333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 42),
('33333333-3333-3333-3333-333333333333', 'c4444444-4444-4444-4444-444444444444', 42),
-- David Kim - Business subjects
('44444444-4444-4444-4444-444444444444', 'd1111111-1111-1111-1111-111111111111', 35),
('44444444-4444-4444-4444-444444444444', 'd2222222-2222-2222-2222-222222222222', 38),
('44444444-4444-4444-4444-444444444444', 'd3333333-3333-3333-3333-333333333333', 32),
('44444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 40),
-- Jessica Park - Psychology subjects
('55555555-5555-5555-5555-555555555555', 'e1111111-1111-1111-1111-111111111111', 40),
('55555555-5555-5555-5555-555555555555', 'e2222222-2222-2222-2222-222222222222', 45),
('55555555-5555-5555-5555-555555555555', 'e3333333-3333-3333-3333-333333333333', 35),
('55555555-5555-5555-5555-555555555555', 'e4444444-4444-4444-4444-444444444444', 35),
-- Michael Thompson - English subjects
('66666666-6666-6666-6666-666666666666', 'f1111111-1111-1111-1111-111111111111', 30),
('66666666-6666-6666-6666-666666666666', 'f2222222-2222-2222-2222-222222222222', 32),
('66666666-6666-6666-6666-666666666666', 'f3333333-3333-3333-3333-333333333333', 30),
('66666666-6666-6666-6666-666666666666', 'f4444444-4444-4444-4444-444444444444', 32),
-- Aisha Patel - Chemistry/Engineering subjects
('77777777-7777-7777-7777-777777777777', 'g1111111-1111-1111-1111-111111111111', 44),
('77777777-7777-7777-7777-777777777777', 'g2222222-2222-2222-2222-222222222222', 46),
('77777777-7777-7777-7777-777777777777', 'a1111111-1111-1111-1111-111111111111', 40),
('77777777-7777-7777-7777-777777777777', 'g3333333-3333-3333-3333-333333333333', 38),
-- Ryan Mitchell - History/Political Science subjects
('88888888-8888-8888-8888-888888888888', 'h1111111-1111-1111-1111-111111111111', 32),
('88888888-8888-8888-8888-888888888888', 'h2222222-2222-2222-2222-222222222222', 32),
('88888888-8888-8888-8888-888888888888', 'h3333333-3333-3333-3333-333333333333', 30),
('88888888-8888-8888-8888-888888888888', 'h4444444-4444-4444-4444-444444444444', 35)
ON CONFLICT (tutor_id, subject_id) DO UPDATE SET
  hourly_rate = EXCLUDED.hourly_rate;