-- Add some conversations and messages for demo
INSERT INTO conversations (participant1_id, participant2_id, status, created_at, last_message_at)
VALUES
  ('44444444-4444-4444-4444-444444444444'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'accepted', NOW() - INTERVAL '2 days', NOW() - INTERVAL '30 minutes'),
  ('55555555-5555-5555-5555-555555555555'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'accepted', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours'),
  ('44444444-4444-4444-4444-444444444444'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'pending', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');

-- Add messages to the accepted conversations
INSERT INTO messages (conversation_id, sender_id, content, created_at)
SELECT 
  c.id, 
  '44444444-4444-4444-4444-444444444444'::uuid,
  'Hi Sarah! I was wondering if you could help me with some calculus problems?',
  NOW() - INTERVAL '2 days'
FROM conversations c 
WHERE participant1_id = '44444444-4444-4444-4444-444444444444'::uuid 
  AND participant2_id = '11111111-1111-1111-1111-111111111111'::uuid;

INSERT INTO messages (conversation_id, sender_id, content, created_at)
SELECT 
  c.id, 
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Of course! I''d be happy to help. What specific topics are you struggling with?',
  NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'
FROM conversations c 
WHERE participant1_id = '44444444-4444-4444-4444-444444444444'::uuid 
  AND participant2_id = '11111111-1111-1111-1111-111111111111'::uuid;

INSERT INTO messages (conversation_id, sender_id, content, created_at)
SELECT 
  c.id, 
  '44444444-4444-4444-4444-444444444444'::uuid,
  'Thanks! Our last session was really helpful. Looking forward to our next one!',
  NOW() - INTERVAL '30 minutes'
FROM conversations c 
WHERE participant1_id = '44444444-4444-4444-4444-444444444444'::uuid 
  AND participant2_id = '11111111-1111-1111-1111-111111111111'::uuid;

-- Add campus posts for social features
INSERT INTO campus_posts (user_id, content, post_type, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Just finished an amazing tutoring session! Love helping students master calculus 📐✨', 'post', NOW() - INTERVAL '3 hours'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Pro tip: When debugging code, always start with the simplest test case! 💻🐛', 'post', NOW() - INTERVAL '1 day'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Excited to help more pre-med students this semester! Biology can be fun when explained right 🧬', 'post', NOW() - INTERVAL '2 days');