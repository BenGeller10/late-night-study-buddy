-- Insert sample tutors with proper user IDs for demo
INSERT INTO public.profiles (
    user_id, display_name, avatar_url, is_tutor, bio, experience,
    venmo_handle, followers_count, following_count, onboarding_completed
) VALUES 
-- Sarah Chen - Math & Physics Tutor
(
    gen_random_uuid(), 'Sarah Chen', 
    'https://images.unsplash.com/photo-1494790108755-2616b612b787?w=400&h=400&fit=crop&crop=face',
    true, 'Math PhD student with 3+ years tutoring experience. Specializing in calculus and physics.',
    'Graduate Teaching Assistant, 200+ tutoring sessions completed',
    '@sarahc-math', 15, 8, true
),
-- Marcus Johnson - Chemistry & Biology
(
    gen_random_uuid(), 'Marcus Johnson',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    true, 'Pre-med student passionate about helping others succeed in STEM. Dean''s List for 3 semesters.',
    'Certified tutor, 150+ hours experience, 4.9/5 rating',
    '@marcus-chem', 22, 12, true
),
-- Emily Rodriguez - Computer Science
(
    gen_random_uuid(), 'Emily Rodriguez',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', 
    true, 'Computer Science senior with internship experience at tech companies. Love teaching programming!',
    'Software Engineering Intern, Coding bootcamp mentor',
    '@emily-codes', 31, 19, true
),
-- Alex Thompson - Multiple Subjects
(
    gen_random_uuid(), 'Alex Thompson',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    true, 'Honor student with expertise across multiple subjects. Patient and adaptable teaching style.',
    'Peer tutor for 2+ years, Mathematics Learning Center volunteer',
    '@alex-study', 18, 6, true
);

-- Now link tutors to their subjects with rates
DO $$
DECLARE
    sarah_id UUID;
    marcus_id UUID;
    emily_id UUID;
    alex_id UUID;
    math_subject_id UUID;
    chem_subject_id UUID;
    phys_subject_id UUID;
    bio_subject_id UUID;
    cs_subject_id UUID;
BEGIN
    -- Get tutor IDs
    SELECT user_id INTO sarah_id FROM public.profiles WHERE display_name = 'Sarah Chen' AND is_tutor = true;
    SELECT user_id INTO marcus_id FROM public.profiles WHERE display_name = 'Marcus Johnson' AND is_tutor = true;
    SELECT user_id INTO emily_id FROM public.profiles WHERE display_name = 'Emily Rodriguez' AND is_tutor = true;
    SELECT user_id INTO alex_id FROM public.profiles WHERE display_name = 'Alex Thompson' AND is_tutor = true;
    
    -- Get subject IDs
    SELECT id INTO math_subject_id FROM public.subjects WHERE code = 'MATH 1431';
    SELECT id INTO chem_subject_id FROM public.subjects WHERE code = 'CHEM 1411';
    SELECT id INTO phys_subject_id FROM public.subjects WHERE code = 'PHYS 1301';
    SELECT id INTO bio_subject_id FROM public.subjects WHERE code = 'BIOL 1406';
    SELECT id INTO cs_subject_id FROM public.subjects WHERE code = 'COSC 1436';
    
    -- Link Sarah to Math & Physics
    IF sarah_id IS NOT NULL AND math_subject_id IS NOT NULL THEN
        INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate) VALUES (sarah_id, math_subject_id, 25);
    END IF;
    IF sarah_id IS NOT NULL AND phys_subject_id IS NOT NULL THEN
        INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate) VALUES (sarah_id, phys_subject_id, 30);
    END IF;
    
    -- Link Marcus to Chemistry & Biology
    IF marcus_id IS NOT NULL AND chem_subject_id IS NOT NULL THEN
        INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate) VALUES (marcus_id, chem_subject_id, 28);
    END IF;
    IF marcus_id IS NOT NULL AND bio_subject_id IS NOT NULL THEN
        INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate) VALUES (marcus_id, bio_subject_id, 26);
    END IF;
    
    -- Link Emily to Computer Science
    IF emily_id IS NOT NULL AND cs_subject_id IS NOT NULL THEN
        INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate) VALUES (emily_id, cs_subject_id, 35);
    END IF;
    
    -- Link Alex to Math & Physics (different rates)
    IF alex_id IS NOT NULL AND math_subject_id IS NOT NULL THEN
        INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate) VALUES (alex_id, math_subject_id, 22);
    END IF;
    IF alex_id IS NOT NULL AND phys_subject_id IS NOT NULL THEN
        INSERT INTO public.tutor_subjects (tutor_id, subject_id, hourly_rate) VALUES (alex_id, phys_subject_id, 25);
    END IF;
END $$;