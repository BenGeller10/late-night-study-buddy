-- Add basic demo data for Campus Connect

-- Add tutor subjects relationship for demo tutors
INSERT INTO tutor_subjects (tutor_id, subject_id, hourly_rate)
SELECT 
  '11111111-1111-1111-1111-111111111111' as tutor_id,
  s.id as subject_id,
  45.00 as hourly_rate
FROM subjects s 
WHERE s.code = 'CS'
AND NOT EXISTS (
  SELECT 1 FROM tutor_subjects ts 
  WHERE ts.tutor_id = '11111111-1111-1111-1111-111111111111' 
  AND ts.subject_id = s.id
);

INSERT INTO tutor_subjects (tutor_id, subject_id, hourly_rate)
SELECT 
  '22222222-2222-2222-2222-222222222222' as tutor_id,
  s.id as subject_id,
  42.00 as hourly_rate
FROM subjects s 
WHERE s.code = 'MATH'
AND NOT EXISTS (
  SELECT 1 FROM tutor_subjects ts 
  WHERE ts.tutor_id = '22222222-2222-2222-2222-222222222222' 
  AND ts.subject_id = s.id
);

-- Add some campus posts for demo
INSERT INTO campus_posts (user_id, content, post_type, created_at) 
VALUES 
('11111111-1111-1111-1111-111111111111', 'Just finished helping 3 students with their CS homework today! Feeling grateful to be part of this amazing community 🧠💫', 'post', now() - interval '2 hours'),
('22222222-2222-2222-2222-222222222222', 'Pro tip: When studying calculus, always start with the fundamentals. Master your derivatives before moving to integrals! 📐', 'tip', now() - interval '5 hours'),
('55555555-5555-5555-5555-555555555555', 'Finally understanding linear algebra thanks to Marcus! This campus tutoring program is a game changer 🙌', 'post', now() - interval '3 hours');

-- Add some sample user follows
INSERT INTO user_follows (follower_id, following_id) 
VALUES 
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222'),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111');