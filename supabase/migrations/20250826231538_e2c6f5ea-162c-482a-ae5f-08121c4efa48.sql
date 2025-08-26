-- Insert sample sessions with fixed subject selection
INSERT INTO sessions (
  student_id, tutor_id, subject_id, scheduled_at, duration_minutes, 
  total_amount, status, payment_status, student_rating, location, notes
)
VALUES
  -- Completed sessions (for earnings)
  ('44444444-4444-4444-4444-444444444444'::uuid, 
   '11111111-1111-1111-1111-111111111111'::uuid, 
   (SELECT id FROM subjects WHERE name = 'Calculus I' LIMIT 1), 
   NOW() - INTERVAL '3 days', 60, 45, 'completed', 'paid', 5, 
   'Bird Library - Study Room 3', 'Great session! Really helped me understand derivatives.'),
  
  ('55555555-5555-5555-5555-555555555555'::uuid, 
   '11111111-1111-1111-1111-111111111111'::uuid,
   (SELECT id FROM subjects WHERE name = 'Statistics' LIMIT 1),
   NOW() - INTERVAL '1 week', 90, 67.50, 'completed', 'paid', 4, 
   'Whitman Library', 'Statistics concepts were explained clearly.'),
   
  ('44444444-4444-4444-4444-444444444444'::uuid, 
   '22222222-2222-2222-2222-222222222222'::uuid,
   (SELECT id FROM subjects WHERE name = 'Computer Science' LIMIT 1),
   NOW() - INTERVAL '5 days', 120, 100, 'completed', 'paid', 5, 
   'Online - Zoom', 'Excellent help with algorithms and data structures.'),
   
  -- Upcoming confirmed sessions
  ('55555555-5555-5555-5555-555555555555'::uuid, 
   '33333333-3333-3333-3333-333333333333'::uuid,
   (SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1),
   NOW() + INTERVAL '2 days', 60, 45, 'confirmed', 'pending', NULL, 
   'Life Sciences Building - Room 101', 'Review for midterm exam.'),
   
  ('44444444-4444-4444-4444-444444444444'::uuid, 
   '11111111-1111-1111-1111-111111111111'::uuid,
   (SELECT id FROM subjects WHERE name = 'Calculus I' LIMIT 1),
   NOW() + INTERVAL '1 week', 60, 45, 'confirmed', 'pending', NULL, 
   'Bird Library - Study Room 5', 'Integration techniques practice.'),

  -- This week sessions for streak
  ('44444444-4444-4444-4444-444444444444'::uuid, 
   '11111111-1111-1111-1111-111111111111'::uuid,
   (SELECT id FROM subjects WHERE name = 'Calculus I' LIMIT 1),
   DATE_TRUNC('week', NOW()) + INTERVAL '1 day', 60, 45, 'completed', 'paid', 5, 
   'Bird Library', 'Weekly calc session'),
   
  ('44444444-4444-4444-4444-444444444444'::uuid, 
   '22222222-2222-2222-2222-222222222222'::uuid,
   (SELECT id FROM subjects WHERE name = 'Computer Science' LIMIT 1),
   DATE_TRUNC('week', NOW()) + INTERVAL '3 days', 60, 50, 'completed', 'paid', 4, 
   'Online', 'CS weekly session');