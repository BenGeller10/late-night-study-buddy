-- Temporarily disable the foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Insert sample subjects first
INSERT INTO public.subjects (id, name, code) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Calculus I', 'MATH 151'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Physics I', 'PHYS 201'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Chemistry', 'CHEM 101'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Computer Science', 'CS 101'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Biology', 'BIO 101')
ON CONFLICT (id) DO NOTHING;

-- Insert sample tutor profiles (with generated UUIDs for user_id)
INSERT INTO public.profiles (id, user_id, display_name, bio, campus, major, year, is_tutor, avatar_url, venmo_handle) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', gen_random_uuid(), 'Sarah Chen', 'Math whiz with 3 years tutoring experience. I make calculus fun and easy to understand!', 'Main Campus', 'Mathematics', 3, true, 'https://images.unsplash.com/photo-1494790108755-2616b612b8a5?w=150&h=150&fit=crop&crop=face', '@sarah-math'),
  ('550e8400-e29b-41d4-a716-446655440011', gen_random_uuid(), 'Alex Rodriguez', 'Physics PhD student passionate about helping others understand the universe!', 'Main Campus', 'Physics', 4, true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', '@alex-physics'),
  ('550e8400-e29b-41d4-a716-446655440012', gen_random_uuid(), 'Emily Johnson', 'Pre-med student who aced all chemistry courses. Let me help you master those reactions!', 'Main Campus', 'Chemistry', 2, true, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', '@emily-chem'),
  ('550e8400-e29b-41d4-a716-446655440013', gen_random_uuid(), 'Marcus Thompson', 'CS major with internship experience. I can help with coding, algorithms, and data structures!', 'Main Campus', 'Computer Science', 3, true, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', '@marcus-code'),
  ('550e8400-e29b-41d4-a716-446655440014', gen_random_uuid(), 'Sophia Williams', 'Biology major heading to med school. Passionate about life sciences and helping students succeed!', 'Main Campus', 'Biology', 4, true, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face', '@sophia-bio')
ON CONFLICT (id) DO NOTHING;

-- Insert tutor-subject relationships with hourly rates
INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 25.00), -- Sarah - Calculus
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 30.00), -- Alex - Physics
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 28.00), -- Alex - Calculus
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 22.00), -- Emily - Chemistry
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 35.00), -- Marcus - CS
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 20.00), -- Sophia - Biology
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 18.00)  -- Sophia - Chemistry
ON CONFLICT DO NOTHING;