-- Set view to use security_invoker to fix linter error
ALTER VIEW public.public_profiles SET (security_invoker = on);