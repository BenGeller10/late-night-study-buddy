-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update profiles table to make venmo_handle required for tutors
ALTER TABLE public.profiles 
ADD CONSTRAINT check_tutor_venmo 
CHECK (
  (is_tutor = false) OR 
  (is_tutor = true AND venmo_handle IS NOT NULL AND venmo_handle != '')
);

-- Update profiles table to require avatar_url
ALTER TABLE public.profiles 
ALTER COLUMN avatar_url SET NOT NULL;

-- Update the default value to ensure existing profiles have a placeholder
UPDATE public.profiles 
SET avatar_url = '/placeholder.svg' 
WHERE avatar_url IS NULL;