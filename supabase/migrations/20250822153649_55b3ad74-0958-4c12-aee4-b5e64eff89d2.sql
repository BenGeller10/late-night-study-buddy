-- Enable real-time updates for profiles and sessions tables
-- This allows the app stats to update automatically when users join or sessions are created

-- Enable replica identity for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Enable replica identity for sessions table  
ALTER TABLE public.sessions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;