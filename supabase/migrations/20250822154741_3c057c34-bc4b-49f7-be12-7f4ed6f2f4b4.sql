-- Create study groups table
CREATE TABLE public.study_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_name TEXT NOT NULL,
  course_code TEXT NOT NULL,
  description TEXT,
  max_members INTEGER NOT NULL DEFAULT 15,
  created_by UUID NOT NULL,
  meeting_time TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study group members table
CREATE TABLE public.study_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  role TEXT NOT NULL DEFAULT 'member',
  UNIQUE(group_id, user_id)
);

-- Create group messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Study groups policies
CREATE POLICY "Anyone can view study groups" 
ON public.study_groups 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create study groups" 
ON public.study_groups 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" 
ON public.study_groups 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Study group members policies
CREATE POLICY "Users can view group members if they're in the group" 
ON public.study_group_members 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.study_group_members sgm 
  WHERE sgm.group_id = study_group_members.group_id 
  AND sgm.user_id = auth.uid()
));

CREATE POLICY "Users can join groups" 
ON public.study_group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" 
ON public.study_group_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- Group messages policies
CREATE POLICY "Group members can view messages" 
ON public.group_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.study_group_members sgm 
  WHERE sgm.group_id = group_messages.group_id 
  AND sgm.user_id = auth.uid()
));

CREATE POLICY "Group members can send messages" 
ON public.group_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND 
  EXISTS (
    SELECT 1 FROM public.study_group_members sgm 
    WHERE sgm.group_id = group_messages.group_id 
    AND sgm.user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_study_groups_updated_at
BEFORE UPDATE ON public.study_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some demo study groups
INSERT INTO public.study_groups (course_name, course_code, description, created_by, meeting_time, location) VALUES 
('Calculus II', 'MATH 251', 'Working through integration problems and preparing for the final exam', (SELECT user_id FROM profiles WHERE username = 'sarah_johnson' LIMIT 1), 'Daily 7-9 PM', 'Library Study Room A'),
('Organic Chemistry', 'CHEM 301', 'Lab report discussions and reaction mechanism practice', (SELECT user_id FROM profiles WHERE username = 'michael_chen' LIMIT 1), 'Tue/Thu 6-8 PM', 'Chemistry Building Room 205'),
('Computer Science 101', 'CS 101', 'Coding practice sessions and project collaboration', (SELECT user_id FROM profiles WHERE username = 'emma_davis' LIMIT 1), 'Mon/Wed/Fri 5-7 PM', 'Computer Lab 102');