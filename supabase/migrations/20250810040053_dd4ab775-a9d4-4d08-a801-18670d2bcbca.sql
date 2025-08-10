-- Add some test data to help with chat functionality
-- First, let's add a test message to the existing conversation
INSERT INTO public.messages (conversation_id, sender_id, content)
VALUES (
  'db2073ea-608f-4ca9-be8e-eeed4b96566a',
  'ea61b7c1-e479-49b1-8add-2a213e71c7c6',
  'Hello! This is a test message to verify chat functionality.'
);

-- Update the conversation's last_message_at timestamp
UPDATE public.conversations 
SET last_message_at = NOW()
WHERE id = 'db2073ea-608f-4ca9-be8e-eeed4b96566a';