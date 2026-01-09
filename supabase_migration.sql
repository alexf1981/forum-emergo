-- Add is_admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set existing admins
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email IN ('alexfitie1981@gmail.com', 'olivierfitie2015@gmail.com');

-- (Optional) Policy to allow admins to see other profiles (if not already handled by service_role or other policies)
-- This depends on if RLS is enabled and strictly enforced for SELECTs used by AdminService
-- For now, we assume the user running the dashboard might need read access.
-- However, standard 'authenticated' users usually can only see their own profile.
-- We might need a policy:
-- CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = TRUE));
