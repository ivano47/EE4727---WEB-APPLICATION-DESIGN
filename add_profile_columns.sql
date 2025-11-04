-- Add missing columns to profiles table for avatar and phone
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN phone_number VARCHAR(20);