-- Fix security warnings for functions by setting search_path
CREATE OR REPLACE FUNCTION check_tutor_availability(
  p_tutor_id UUID,
  p_scheduled_at TIMESTAMP WITH TIME ZONE,
  p_duration_minutes INTEGER,
  p_session_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for overlapping sessions
  SELECT COUNT(*)
  INTO conflict_count
  FROM public.sessions
  WHERE tutor_id = p_tutor_id
    AND status IN ('confirmed', 'pending_payment', 'in_progress')
    AND (p_session_id IS NULL OR id != p_session_id)
    AND (
      -- New session starts during existing session
      (p_scheduled_at >= scheduled_at AND p_scheduled_at < scheduled_at + INTERVAL '1 minute' * duration_minutes)
      OR
      -- New session ends during existing session  
      (p_scheduled_at + INTERVAL '1 minute' * p_duration_minutes > scheduled_at AND p_scheduled_at + INTERVAL '1 minute' * p_duration_minutes <= scheduled_at + INTERVAL '1 minute' * duration_minutes)
      OR
      -- New session completely encompasses existing session
      (p_scheduled_at <= scheduled_at AND p_scheduled_at + INTERVAL '1 minute' * p_duration_minutes >= scheduled_at + INTERVAL '1 minute' * duration_minutes)
    );
    
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix trigger function security
CREATE OR REPLACE FUNCTION validate_session_scheduling()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check for confirmed or pending sessions
  IF NEW.status IN ('confirmed', 'pending_payment', 'in_progress') AND NEW.scheduled_at IS NOT NULL THEN
    IF NOT public.check_tutor_availability(NEW.tutor_id, NEW.scheduled_at, NEW.duration_minutes, NEW.id) THEN
      RAISE EXCEPTION 'Tutor is not available at the requested time. Please choose a different time slot.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';