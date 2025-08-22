-- Update the handle_new_user function to ensure all user data starts at zero/clean defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Create user profile with clean defaults
  INSERT INTO public.profiles (
    user_id, 
    display_name, 
    avatar_url, 
    is_tutor,
    venmo_handle,
    schedule_data,
    bio,
    experience,
    followers_count,
    following_count,
    onboarding_completed,
    study_preferences_completed,
    role_preference
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'is_tutor')::boolean, false),
    NEW.raw_user_meta_data ->> 'venmo_handle',
    NEW.raw_user_meta_data ->> 'schedule_data',
    COALESCE(NEW.raw_user_meta_data ->> 'bio', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'experience', ''),
    0, -- followers_count starts at 0
    0, -- following_count starts at 0
    false, -- onboarding not completed
    false, -- study preferences not completed  
    COALESCE(NEW.raw_user_meta_data ->> 'role_preference', 'student')
  );
  
  -- Initialize study streak at zero
  INSERT INTO public.study_streaks (user_id, current_streak, longest_streak)
  VALUES (NEW.id, 0, 0);
  
  -- Initialize user preferences with empty defaults
  INSERT INTO public.user_preferences (
    user_id,
    academic_goals,
    stress_management,
    favorite_subjects,
    study_schedule,
    study_environment,
    learning_style,
    collaboration_preference
  )
  VALUES (
    NEW.id,
    '{}'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    null,
    null,
    null,
    null
  );
  
  RETURN NEW;
END;
$function$;