-- Insert sample subjects for tutors to choose from (using only existing columns)
INSERT INTO public.subjects (id, name, code) VALUES 
  (gen_random_uuid(), 'Calculus I', 'MATH 1431'),
  (gen_random_uuid(), 'General Chemistry', 'CHEM 1411'),
  (gen_random_uuid(), 'Physics I', 'PHYS 1301'),
  (gen_random_uuid(), 'Biology I', 'BIOL 1406'),
  (gen_random_uuid(), 'English Composition', 'ENGL 1301'),
  (gen_random_uuid(), 'Statistics', 'STAT 2480'),
  (gen_random_uuid(), 'Organic Chemistry', 'CHEM 2423'),
  (gen_random_uuid(), 'Computer Science I', 'COSC 1436'),
  (gen_random_uuid(), 'Microeconomics', 'ECON 2306'),
  (gen_random_uuid(), 'Psychology', 'PSYC 2301')
ON CONFLICT (code) DO NOTHING;

-- Insert sample tutors with their subjects
DO $$
DECLARE
    tutor_user_id UUID;
    subject_math_id UUID;
    subject_chem_id UUID;
    subject_phys_id UUID;
    subject_bio_id UUID;
    subject_cs_id UUID;
BEGIN
    -- Get subject IDs
    SELECT id INTO subject_math_id FROM public.subjects WHERE code = 'MATH 1431';
    SELECT id INTO subject_chem_id FROM public.subjects WHERE code = 'CHEM 1411';
    SELECT id INTO subject_phys_id FROM public.subjects WHERE code = 'PHYS 1301';
    SELECT id INTO subject_bio_id FROM public.subjects WHERE code = 'BIOL 1406';
    SELECT id INTO subject_cs_id FROM public.subjects WHERE code = 'COSC 1436';

    -- Sample Tutor 1: Sarah Chen - Math & Physics
    tutor_user_id := gen_random_uuid();
    INSERT INTO public.profiles (
        user_id, display_name, avatar_url, is_tutor, bio, experience, 
        venmo_handle, followers_count, following_count, onboarding_completed
    ) VALUES (
        tutor_user_id, 'Sarah Chen', 
        'https://images.unsplash.com/photo-1494790108755-2616b612b787?w=400&h=400&fit=crop&crop=face',
        true, 'Math PhD student with 3+ years tutoring experience. Specializing in calculus and physics.',
        'Graduate Teaching Assistant, 200+ tutoring sessions completed',
        '@sarahc-math', 15, 8, true
    );
    
    -- Add Sarah's subjects
    INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate) VALUES
        (tutor_user_id, subject_math_id, 25),
        (tutor_user_id, subject_phys_id, 30);

    -- Sample Tutor 2: Marcus Johnson - Chemistry & Biology  
    tutor_user_id := gen_random_uuid();
    INSERT INTO public.profiles (
        user_id, display_name, avatar_url, is_tutor, bio, experience,
        venmo_handle, followers_count, following_count, onboarding_completed
    ) VALUES (
        tutor_user_id, 'Marcus Johnson',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        true, 'Pre-med student passionate about helping others succeed in STEM. Dean''s List for 3 semesters.',
        'Certified tutor, 150+ hours experience, 4.9/5 rating',
        '@marcus-chem', 22, 12, true
    );
    
    INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate) VALUES
        (tutor_user_id, subject_chem_id, 28),
        (tutor_user_id, subject_bio_id, 26);

    -- Sample Tutor 3: Emily Rodriguez - Computer Science
    tutor_user_id := gen_random_uuid();
    INSERT INTO public.profiles (
        user_id, display_name, avatar_url, is_tutor, bio, experience,
        venmo_handle, followers_count, following_count, onboarding_completed
    ) VALUES (
        tutor_user_id, 'Emily Rodriguez',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', 
        true, 'Computer Science senior with internship experience at tech companies. Love teaching programming!',
        'Software Engineering Intern, Coding bootcamp mentor',
        '@emily-codes', 31, 19, true
    );
    
    INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate) VALUES
        (tutor_user_id, subject_cs_id, 35);

    -- Sample Tutor 4: Alex Thompson - Multiple Subjects
    tutor_user_id := gen_random_uuid();
    INSERT INTO public.profiles (
        user_id, display_name, avatar_url, is_tutor, bio, experience,
        venmo_handle, followers_count, following_count, onboarding_completed
    ) VALUES (
        tutor_user_id, 'Alex Thompson',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        true, 'Honor student with expertise across multiple subjects. Patient and adaptable teaching style.',
        'Peer tutor for 2+ years, Mathematics Learning Center volunteer',
        '@alex-study', 18, 6, true
    );
    
    INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate) VALUES
        (tutor_user_id, subject_math_id, 22),
        (tutor_user_id, subject_phys_id, 25);

END $$;