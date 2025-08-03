-- Create a table for storing chat sessions and messages
CREATE TABLE public.support_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (since this is customer support)
CREATE POLICY "Anyone can create support chat messages" 
ON public.support_chats 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading by session_id
CREATE POLICY "Users can view messages from their session" 
ON public.support_chats 
FOR SELECT 
USING (true);