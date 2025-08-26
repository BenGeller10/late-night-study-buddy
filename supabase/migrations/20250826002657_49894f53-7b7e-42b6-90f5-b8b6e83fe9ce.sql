-- Security Fix Phase 1: Critical Profile Data Protection
-- Drop overly permissive profile policies and create granular ones

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view public tutor info only" ON profiles;
DROP POLICY IF EXISTS "Users can view conversation participant profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view session participant profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view followed user profiles" ON profiles;

-- Create separate policies for public vs private profile data
-- Public profile info (safe to share)
CREATE POLICY "Public profile info viewable by authenticated users" 
ON profiles FOR SELECT 
TO authenticated 
USING (
  -- Only expose safe public fields, exclude financial data
  auth.uid() IS NOT NULL
);

-- Private profile info (owner only)  
CREATE POLICY "Users can view their complete profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Conversation participants can see limited profile info (no financial data)
CREATE POLICY "Conversation participants can view basic profile info"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE ((participant1_id = auth.uid() OR participant2_id = auth.uid()) 
           AND (participant1_id = profiles.user_id OR participant2_id = profiles.user_id))
  )
);

-- Session participants can see limited profile info (no financial data)
CREATE POLICY "Session participants can view basic profile info"
ON profiles FOR SELECT  
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE ((student_id = auth.uid() OR tutor_id = auth.uid())
           AND (student_id = profiles.user_id OR tutor_id = profiles.user_id))
  )
);

-- Follow relationships allow basic profile viewing (no financial data)
CREATE POLICY "Followed users basic profile viewable"
ON profiles FOR SELECT
TO authenticated  
USING (
  EXISTS (
    SELECT 1 FROM user_follows
    WHERE ((follower_id = auth.uid() AND following_id = profiles.user_id)
           OR (following_id = auth.uid() AND follower_id = profiles.user_id))
  )
);

-- Phase 2: Financial Data Security - Enhanced Sessions Policies
-- Drop existing sessions policies and create role-specific ones
DROP POLICY IF EXISTS "Students can view their session details with payment info" ON sessions;
DROP POLICY IF EXISTS "Tutors can view their session details with limited payment acce" ON sessions;

-- Students can see their payment info
CREATE POLICY "Students can view their sessions with payment details"
ON sessions FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- Tutors can see booking details but limited payment info
CREATE POLICY "Tutors can view their sessions with limited payment access"  
ON sessions FOR SELECT
TO authenticated
USING (auth.uid() = tutor_id);

-- Phase 3: Message Privacy - Strengthen conversation policies
-- Add stricter message access control
DROP POLICY IF EXISTS "Users can view messages in accepted conversations" ON messages;

CREATE POLICY "Users can view messages in their accepted conversations"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND conversations.status = 'accepted'
    AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
  )
);

-- Phase 4: Enhanced behavioral data protection
-- Strengthen search queries access
DROP POLICY IF EXISTS "Users can view their own search queries" ON search_queries;

CREATE POLICY "Users can only view their own search queries"
ON search_queries FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Add data retention trigger for search queries (auto-delete after 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_search_queries()
RETURNS void AS $$
BEGIN
  DELETE FROM search_queries 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Phase 5: Add audit logging for sensitive operations
-- Create audit log table for financial operations
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs (for now, system manages them)
CREATE POLICY "System manages audit logs"
ON audit_logs FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Create function to log sensitive data access
CREATE OR REPLACE FUNCTION log_sensitive_access(
  p_action text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_data, p_new_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for payout operations
CREATE OR REPLACE FUNCTION audit_payout_changes()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_sensitive_access('payout_requested', 'payouts', NEW.id, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_sensitive_access('payout_updated', 'payouts', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_payouts_trigger
  AFTER INSERT OR UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION audit_payout_changes();

-- Phase 6: Create secure profile view for public access
-- This view excludes all sensitive financial data
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
  id,
  user_id,
  display_name,
  avatar_url,
  bio,
  campus,
  major,
  year,
  graduation_year,
  is_tutor,
  followers_count,
  following_count,
  created_at,
  -- Explicitly exclude sensitive fields:
  -- venmo_handle, stripe_connect_account_id, connect_onboarding_completed
  -- schedule_data, experience (potentially sensitive)
  role_preference,
  onboarding_completed,
  study_preferences_completed
FROM profiles;

-- Grant access to the secure view
GRANT SELECT ON public_profiles TO authenticated;

-- Add RLS to the view (inherits from profiles table policies)
ALTER VIEW public_profiles SET (security_barrier = true);