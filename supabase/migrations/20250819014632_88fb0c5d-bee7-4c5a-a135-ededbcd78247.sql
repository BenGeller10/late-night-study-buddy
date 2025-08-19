-- Fix search_queries table privacy - users should only see their own searches
DROP POLICY IF EXISTS "Users can view search queries" ON public.search_queries;
DROP POLICY IF EXISTS "System can insert search queries" ON public.search_queries;

-- Users can only view their own search queries
CREATE POLICY "Users can view their own search queries" ON public.search_queries
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own search queries
CREATE POLICY "Users can insert their own search queries" ON public.search_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON public.search_queries(user_id);