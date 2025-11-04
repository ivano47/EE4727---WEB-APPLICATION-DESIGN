-- ============================================
-- Supabase Migration SQL
-- Clinic Appointment System
-- ============================================
-- This SQL creates tables compatible with Supabase's PostgreSQL database
-- Key changes from MySQL:
-- 1. Merged patients & doctors into single profiles table
-- 2. profiles.user_id references auth.users(id) for Supabase auth
-- 3. Changed patient_id/doctor_id in appointments to UUIDs
-- 4. Updated data types for PostgreSQL compatibility
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: profiles
-- ============================================
-- Replaces both patients and doctors tables
-- Links to Supabase's built-in auth.users table
CREATE TABLE IF NOT EXISTS profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor')),
    specialty VARCHAR(50),
    bio TEXT,
    phone_number VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- Table: doctor_schedules
-- ============================================
-- Stores doctor availability by day and time
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id BIGSERIAL PRIMARY KEY,
    doctor_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_user_id ON doctor_schedules(doctor_user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_day_of_week ON doctor_schedules(day_of_week);

-- ============================================
-- Table: appointments
-- ============================================
-- Updated to use UUID foreign keys referencing profiles.user_id
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    doctor_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    appointment_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_user_id ON appointments(patient_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_user_id ON appointments(doctor_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_time ON appointments(appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- ============================================
-- Trigger: Update updated_at timestamp
-- ============================================
-- Auto-update updated_at column on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to appointments table
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can read all profiles (to see doctors list)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Users can only update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can insert their own profile (during registration)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Doctor schedules policies
-- Anyone can view doctor schedules (for booking)
DROP POLICY IF EXISTS "Doctor schedules are viewable by everyone" ON doctor_schedules;
CREATE POLICY "Doctor schedules are viewable by everyone"
    ON doctor_schedules FOR SELECT
    USING (true);

-- Only doctors can manage their own schedules
DROP POLICY IF EXISTS "Doctors can manage own schedules" ON doctor_schedules;
CREATE POLICY "Doctors can manage own schedules"
    ON doctor_schedules FOR ALL
    USING (
        auth.uid() = doctor_user_id
    );

-- Appointments policies
-- Patients can view their own appointments
DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
CREATE POLICY "Patients can view own appointments"
    ON appointments FOR SELECT
    USING (
        auth.uid() = patient_user_id
        OR auth.uid() = doctor_user_id
    );

-- Patients can create appointments
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
CREATE POLICY "Patients can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (auth.uid() = patient_user_id);

-- Patients and doctors can update their appointments
DROP POLICY IF EXISTS "Users can update their appointments" ON appointments;
CREATE POLICY "Users can update their appointments"
    ON appointments FOR UPDATE
    USING (
        auth.uid() = patient_user_id
        OR auth.uid() = doctor_user_id
    );

-- Only patients can cancel their own appointments
DROP POLICY IF EXISTS "Patients can cancel own appointments" ON appointments;
CREATE POLICY "Patients can cancel own appointments"
    ON appointments FOR DELETE
    USING (auth.uid() = patient_user_id);

-- ============================================
-- Sample Data: Seed Doctors with Default Password
-- ============================================
-- Creates 4 doctors with password: doctor123
-- IMPORTANT: Run this in Supabase SQL Editor or use Supabase client
-- This uses Supabase's auth.users table for authentication

-- Step 1: Create auth users for doctors (using Supabase Admin API)
-- You'll need to run this via Supabase client or Admin API:
/*
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const doctors = [
  { email: 's.tan@ntu.clinic', password: 'doctor123', full_name: 'Dr. Sarah Tan', specialty: 'Family Doctor', bio: 'Board-certified family physician with 15 years of experience in comprehensive primary care.' },
  { email: 'm.chen@ntu.clinic', password: 'doctor123', full_name: 'Dr. Michael Chen', specialty: 'Family Doctor', bio: 'Specializes in preventive medicine and chronic disease management for all ages.' },
  { email: 'e.wong@ntu.clinic', password: 'doctor123', full_name: 'Dr. Emily Wong', specialty: 'Dentist', bio: 'General dentist specializing in cosmetic dentistry and preventive oral care.' },
  { email: 'r.lim@ntu.clinic', password: 'doctor123', full_name: 'Dr. Robert Lim', specialty: 'Dentist', bio: 'Experienced in advanced dental procedures including implants and orthodontics.' }
]

for (const doctor of doctors) {
  const { data: authUser, error } = await supabase.auth.admin.createUser({
    email: doctor.email,
    password: doctor.password,
    email_confirm: true
  })
  
  if (authUser) {
    await supabase.from('profiles').insert({
      user_id: authUser.user.id,
      full_name: doctor.full_name,
      email: doctor.email,
      role: 'doctor',
      specialty: doctor.specialty,
      bio: doctor.bio
    })
  }
}
*/

-- Step 2: Insert doctor schedules (run AFTER creating doctors above)
-- Replace UUIDs with actual user_id values from auth.users or profiles table

-- Get doctor UUIDs first:
-- SELECT user_id, full_name, email FROM profiles WHERE role = 'doctor' ORDER BY full_name;

-- Dr. Sarah Tan schedules (replace 'UUID1' with actual UUID)
-- INSERT INTO doctor_schedules (doctor_user_id, day_of_week, start_time, end_time) VALUES
-- ('UUID1', 'Monday', '09:00:00', '17:00:00'),
-- ('UUID1', 'Tuesday', '09:00:00', '17:00:00'),
-- ('UUID1', 'Wednesday', '09:00:00', '17:00:00'),
-- ('UUID1', 'Thursday', '09:00:00', '17:00:00'),
-- ('UUID1', 'Friday', '09:00:00', '15:00:00');

-- Dr. Michael Chen schedules (replace 'UUID2' with actual UUID)
-- INSERT INTO doctor_schedules (doctor_user_id, day_of_week, start_time, end_time) VALUES
-- ('UUID2', 'Monday', '10:00:00', '18:00:00'),
-- ('UUID2', 'Wednesday', '10:00:00', '18:00:00'),
-- ('UUID2', 'Thursday', '10:00:00', '18:00:00'),
-- ('UUID2', 'Friday', '10:00:00', '18:00:00'),
-- ('UUID2', 'Saturday', '09:00:00', '13:00:00');

-- Dr. Emily Wong schedules (replace 'UUID3' with actual UUID)
-- INSERT INTO doctor_schedules (doctor_user_id, day_of_week, start_time, end_time) VALUES
-- ('UUID3', 'Monday', '08:00:00', '16:00:00'),
-- ('UUID3', 'Tuesday', '08:00:00', '16:00:00'),
-- ('UUID3', 'Thursday', '08:00:00', '16:00:00'),
-- ('UUID3', 'Friday', '08:00:00', '16:00:00'),
-- ('UUID3', 'Saturday', '09:00:00', '12:00:00');

-- Dr. Robert Lim schedules (replace 'UUID4' with actual UUID)
-- INSERT INTO doctor_schedules (doctor_user_id, day_of_week, start_time, end_time) VALUES
-- ('UUID4', 'Tuesday', '09:00:00', '17:00:00'),
-- ('UUID4', 'Wednesday', '09:00:00', '17:00:00'),
-- ('UUID4', 'Thursday', '09:00:00', '17:00:00'),
-- ('UUID4', 'Friday', '09:00:00', '17:00:00'),
-- ('UUID4', 'Saturday', '10:00:00', '14:00:00');

-- ============================================
-- Notes for React/Supabase Implementation
-- ============================================
-- 1. Use Supabase Auth for user registration/login (no passwords in profiles table)
-- 2. After auth signup, insert corresponding profile record
-- 3. Use RLS policies - they automatically filter based on auth.uid()
-- 4. All queries will use UUID (user_id) instead of integer IDs
-- 5. Use Supabase client library for real-time subscriptions
-- 6. TIMESTAMPTZ stores timezone-aware timestamps (better than DATETIME)

-- ============================================
-- API Usage Examples
-- ============================================
-- Get all doctors:
-- SELECT * FROM profiles WHERE role = 'doctor';

-- Get doctor schedules:
-- SELECT * FROM doctor_schedules WHERE doctor_user_id = 'uuid';

-- Book appointment (patient creates):
-- INSERT INTO appointments (patient_user_id, doctor_user_id, appointment_time, status)
-- VALUES (auth.uid(), 'doctor-uuid', '2025-11-05 10:00:00+00', 'scheduled');

-- Get patient's appointments:
-- SELECT a.*, 
--        p_doc.full_name as doctor_name, 
--        p_doc.specialty
-- FROM appointments a
-- JOIN profiles p_doc ON a.doctor_user_id = p_doc.user_id
-- WHERE a.patient_user_id = auth.uid()
-- ORDER BY a.appointment_time ASC;
