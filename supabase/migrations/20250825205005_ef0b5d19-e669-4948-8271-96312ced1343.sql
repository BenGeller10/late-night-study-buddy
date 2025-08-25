-- Create payouts table to track tutor withdrawal requests
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payout_id TEXT,
  stripe_connect_account_id TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add stripe_connect_account_id to profiles for tutors
ALTER TABLE public.profiles 
ADD COLUMN stripe_connect_account_id TEXT,
ADD COLUMN connect_onboarding_completed BOOLEAN DEFAULT FALSE;

-- Enable RLS on payouts table
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Create policies for payouts
CREATE POLICY "Tutors can view their own payouts" 
ON public.payouts 
FOR SELECT 
USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can create payout requests" 
ON public.payouts 
FOR INSERT 
WITH CHECK (auth.uid() = tutor_id);

-- Edge functions can update payouts
CREATE POLICY "System can update payouts" 
ON public.payouts 
FOR UPDATE 
USING (true);

-- Create trigger for updating timestamps
CREATE TRIGGER update_payouts_updated_at
BEFORE UPDATE ON public.payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();