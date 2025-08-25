-- Add status column to conversations table
ALTER TABLE public.conversations 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';

-- Add constraint to ensure valid status values
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_status_check 
CHECK (status IN ('pending', 'accepted', 'declined', 'blocked'));

-- Update existing conversations to be accepted (backwards compatibility)
UPDATE public.conversations SET status = 'accepted';

-- Create index for better performance on status queries
CREATE INDEX idx_conversations_status ON public.conversations(status);

-- Update RLS policies for conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Students can create conversations (they start as pending)
CREATE POLICY "Students can create conversations with tutors" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = participant1_id);

-- Both participants can view accepted conversations
CREATE POLICY "Users can view accepted conversations" 
ON public.conversations 
FOR SELECT 
USING (
  status = 'accepted' 
  AND (auth.uid() = participant1_id OR auth.uid() = participant2_id)
);

-- Tutors can view pending conversations where they are participant2
CREATE POLICY "Tutors can view pending conversations" 
ON public.conversations 
FOR SELECT 
USING (
  status = 'pending' 
  AND auth.uid() = participant2_id
);

-- Tutors can update conversation status (accept/decline)
CREATE POLICY "Tutors can update conversation status" 
ON public.conversations 
FOR UPDATE 
USING (auth.uid() = participant2_id)
WITH CHECK (auth.uid() = participant2_id);

-- Update messages RLS policies to handle pending conversations
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;

-- Users can view messages in accepted conversations
CREATE POLICY "Users can view messages in accepted conversations" 
ON public.messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM conversations 
  WHERE conversations.id = messages.conversation_id 
    AND conversations.status = 'accepted'
    AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
));

-- Users can send messages in accepted conversations
CREATE POLICY "Users can send messages in accepted conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
      AND conversations.status = 'accepted'
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
  )
);

-- Students can send initial messages to pending conversations they created
CREATE POLICY "Students can send initial messages to pending conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
      AND conversations.status = 'pending'
      AND conversations.participant1_id = auth.uid()
  )
);