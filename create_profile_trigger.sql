-- Create a trigger to automatically create a profile when a user signs up
-- Run this in Supabase SQL Editor

-- First, modify the RLS policy to allow the trigger to insert
-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policy that allows service role to insert (for triggers)
CREATE POLICY "Enable insert for authenticated users and service role"
ON profiles FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

-- Create a function that will create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name', NEW.email),
    NEW.email,
    'patient'
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the user creation
  RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a trigger that calls the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
