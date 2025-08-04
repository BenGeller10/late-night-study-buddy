-- Create table for tutor-student connections/matches
CREATE TABLE public.tutor_student_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL,
  student_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tutor_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE public.tutor_student_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for tutor-student connections
CREATE POLICY "Users can view connections they're part of" 
ON public.tutor_student_connections 
FOR SELECT 
USING (auth.uid() = tutor_id OR auth.uid() = student_id);

CREATE POLICY "Students can create connections with tutors" 
ON public.tutor_student_connections 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Tutors can update connection status" 
ON public.tutor_student_connections 
FOR UPDATE 
USING (auth.uid() = tutor_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tutor_student_connections_updated_at
BEFORE UPDATE ON public.tutor_student_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();