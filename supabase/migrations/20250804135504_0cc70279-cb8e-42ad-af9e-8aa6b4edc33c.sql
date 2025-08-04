-- Update handle_new_user function to include bio and experience fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    display_name, 
    avatar_url, 
    is_tutor,
    venmo_handle,
    schedule_data,
    bio,
    experience
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'is_tutor')::boolean, false),
    NEW.raw_user_meta_data ->> 'venmo_handle',
    NEW.raw_user_meta_data ->> 'schedule_data',
    COALESCE(NEW.raw_user_meta_data ->> 'bio', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'experience', '')
  );
  
  INSERT INTO public.study_streaks (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$function$;