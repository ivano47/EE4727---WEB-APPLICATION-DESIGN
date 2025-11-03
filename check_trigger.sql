-- Check if the trigger exists and test it
-- Run this in Supabase SQL Editor

-- 1. Check if the trigger function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- 2. Check if the trigger exists
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Check current users without profiles
SELECT u.id, u.email, p.user_id 
FROM auth.users u 
LEFT JOIN public.profiles p ON u.id = p.user_id 
WHERE p.user_id IS NULL;

-- 4. Manually create profiles for users that don't have them
INSERT INTO public.profiles (user_id, full_name, email, role)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'first_name' || ' ' || u.raw_user_meta_data->>'last_name', u.email),
  u.email,
  'patient'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
