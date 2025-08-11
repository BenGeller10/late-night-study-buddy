-- Fix security vulnerability: Restrict support_chats access to session owners only

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view messages from their session" ON public.support_chats;

-- Create secure policy: Users can only view their own support chat sessions
CREATE POLICY "Users can view their own support chats" 
ON public.support_chats 
FOR SELECT 
TO authenticated
USING (session_id = auth.uid()::text);

-- Update insert policy to ensure session_id matches authenticated user
DROP POLICY IF EXISTS "Anyone can create support chat messages" ON public.support_chats;

CREATE POLICY "Users can create their own support chats" 
ON public.support_chats 
FOR INSERT 
TO authenticated
WITH CHECK (session_id = auth.uid()::text);