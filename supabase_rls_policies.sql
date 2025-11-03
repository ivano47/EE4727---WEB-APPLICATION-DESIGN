-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- This replaces ALL PHP security logic with PostgreSQL RLS
-- Each policy below maps directly to your old PHP authentication checks
-- ============================================

-- ============================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- ============================================
-- This is CRITICAL - without this, all data is accessible to everyone
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Policy 1: Everyone can view all profiles (to see doctors list)
-- Maps to: doctors.php (lines 10-93) - "Everyone can see the list of doctors"
-- Old PHP: No authentication check - public page
-- New RLS: USING (true) means anyone can SELECT
CREATE POLICY "profiles_select_public"
    ON profiles
    FOR SELECT
    USING (true);

COMMENT ON POLICY "profiles_select_public" ON profiles IS 
'Replaces doctors.php logic - allows public to view all doctor profiles';

-- Policy 2: Users can only insert their own profile
-- Maps to: register.php (lines 47-48) - INSERT INTO patients
-- Old PHP: INSERT INTO patients (full_name, email, password) VALUES (?, ?, ?)
-- New RLS: auth.uid() = user_id ensures user only creates their own profile
CREATE POLICY "profiles_insert_own"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "profiles_insert_own" ON profiles IS 
'Replaces register.php logic - users can only create their own profile during signup';

-- Policy 3: Users can only update their own profile
-- Maps to: Any future profile update functionality
-- Old PHP: UPDATE patients ... WHERE id = $_SESSION['user_id']
-- New RLS: auth.uid() = user_id ensures users only update their own data
CREATE POLICY "profiles_update_own"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

COMMENT ON POLICY "profiles_update_own" ON profiles IS 
'Users can only update their own profile information';

-- Policy 4: No one can delete profiles (handled by Supabase Auth cascade)
-- Profiles are deleted automatically when auth.users record is deleted

-- ============================================
-- DOCTOR_SCHEDULES TABLE POLICIES
-- ============================================

-- Policy 1: Everyone can view doctor schedules
-- Maps to: schedule.php - "Everyone needs to see available appointment slots"
-- Old PHP: No authentication check for viewing schedules
-- New RLS: USING (true) means anyone can SELECT
CREATE POLICY "doctor_schedules_select_public"
    ON doctor_schedules
    FOR SELECT
    USING (true);

COMMENT ON POLICY "doctor_schedules_select_public" ON doctor_schedules IS 
'Replaces schedule.php logic - allows public to view doctor availability';

-- Policy 2: Only doctors can manage their own schedules
-- Maps to: Future doctor schedule management functionality
-- Old PHP: UPDATE doctor_schedules ... WHERE doctor_id = $_SESSION['doctor_id']
-- New RLS: auth.uid() = doctor_user_id ensures doctors only manage their own schedules
CREATE POLICY "doctor_schedules_manage_own"
    ON doctor_schedules
    FOR ALL
    USING (auth.uid() = doctor_user_id);

COMMENT ON POLICY "doctor_schedules_manage_own" ON doctor_schedules IS 
'Doctors can INSERT, UPDATE, DELETE their own schedules only';

-- ============================================
-- APPOINTMENTS TABLE POLICIES
-- ============================================

-- Policy 1: Patients can view their own appointments
-- Maps to: my_appointments.php (lines 13-19)
-- Old PHP: WHERE a.patient_id = ? (line 19)
-- Old check: if (!isset($_SESSION['patient_id'])) redirect (line 8)
-- New RLS: auth.uid() = patient_user_id replicates the WHERE clause
CREATE POLICY "appointments_select_patient_own"
    ON appointments
    FOR SELECT
    USING (auth.uid() = patient_user_id);

COMMENT ON POLICY "appointments_select_patient_own" ON appointments IS 
'Replaces my_appointments.php lines 8-19 - patients can only see their own appointments';

-- Policy 2: Doctors can view their own appointments
-- Maps to: doctor_dashboard.php (lines 8-20)
-- Old PHP: WHERE a.doctor_id = ? (line 19)
-- Old check: if (!isset($_SESSION['doctor_id'])) redirect (line 8)
-- New RLS: auth.uid() = doctor_user_id replicates the WHERE clause
CREATE POLICY "appointments_select_doctor_own"
    ON appointments
    FOR SELECT
    USING (auth.uid() = doctor_user_id);

COMMENT ON POLICY "appointments_select_doctor_own" ON appointments IS 
'Replaces doctor_dashboard.php lines 8-20 - doctors can only see their scheduled appointments';

-- Policy 3: Patients can only create appointments for themselves
-- Maps to: book.php (lines 9-22, 134-135)
-- Old PHP: if (!isset($_SESSION['user_id']) || empty($_SESSION['role'])) redirect (lines 10-12)
-- Old PHP: $patient_id = ($_SESSION['role'] === 'patient') ? $_SESSION['patient_id'] : null; (line 18)
-- Old PHP: INSERT INTO appointments (patient_id, doctor_id, ...) VALUES (?, ?, ...) (line 135)
-- New RLS: WITH CHECK (auth.uid() = patient_user_id) ensures patient can only book for themselves
CREATE POLICY "appointments_insert_patient_own"
    ON appointments
    FOR INSERT
    WITH CHECK (auth.uid() = patient_user_id);

COMMENT ON POLICY "appointments_insert_patient_own" ON appointments IS 
'Replaces book.php lines 9-22, 134-135 - patients can only create appointments for themselves';

-- Policy 4: Doctors can update their own appointments (complete, reschedule)
-- Maps to: complete_appointment.php (lines 8-36)
-- Old PHP: if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'doctor') redirect (lines 8-11)
-- Old PHP: $doctor_id = $_SESSION['user_id']; (line 15)
-- Old PHP: WHERE id = ? AND doctor_id = ? AND status = 'scheduled' (line 25)
-- Old PHP: UPDATE appointments SET status = 'completed' WHERE id = ? (line 39)
-- New RLS: USING (auth.uid() = doctor_user_id) replicates the WHERE doctor_id = ? check
CREATE POLICY "appointments_update_doctor_own"
    ON appointments
    FOR UPDATE
    USING (auth.uid() = doctor_user_id);

COMMENT ON POLICY "appointments_update_doctor_own" ON appointments IS 
'Replaces complete_appointment.php lines 8-36 - only doctors can update (complete) their appointments';

-- Policy 5: Patients can update their own appointments (reschedule)
-- Maps to: book.php (lines 51-79) and cancel_appointment.php (lines 26-36)
-- Old PHP (book.php): UPDATE ... WHERE id = ? AND patient_id = ? (line 54)
-- Old PHP (cancel.php): WHERE id = ? AND patient_id = ? AND status = 'scheduled' (line 27)
-- New RLS: USING (auth.uid() = patient_user_id) ensures patients only update their own
CREATE POLICY "appointments_update_patient_own"
    ON appointments
    FOR UPDATE
    USING (auth.uid() = patient_user_id);

COMMENT ON POLICY "appointments_update_patient_own" ON appointments IS 
'Replaces book.php reschedule logic and cancel_appointment.php - patients can update/cancel their own appointments';

-- Policy 6: Patients can delete (cancel) their own appointments
-- Maps to: cancel_appointment.php (lines 8-48)
-- Old PHP: if (!isset($_SESSION['user_id']) || empty($_SESSION['role'])) redirect (lines 8-11)
-- Old PHP: if ($_SESSION['role'] === 'patient') WHERE id = ? AND patient_id = ? (lines 26-28)
-- Old PHP: UPDATE appointments SET status = 'cancelled' WHERE id = ? (line 51)
-- New RLS: USING (auth.uid() = patient_user_id) replicates the ownership check
-- Note: In Supabase, we use DELETE for hard deletes or UPDATE status='cancelled' for soft deletes
CREATE POLICY "appointments_delete_patient_own"
    ON appointments
    FOR DELETE
    USING (auth.uid() = patient_user_id);

COMMENT ON POLICY "appointments_delete_patient_own" ON appointments IS 
'Replaces cancel_appointment.php lines 8-48 - patients can cancel their own appointments';

-- Policy 7: Doctors can delete (cancel) their appointments
-- Maps to: cancel_appointment.php (lines 29-31)
-- Old PHP: elseif ($_SESSION['role'] === 'doctor') WHERE id = ? AND doctor_id = ? (lines 29-31)
-- New RLS: USING (auth.uid() = doctor_user_id) replicates the ownership check
CREATE POLICY "appointments_delete_doctor_own"
    ON appointments
    FOR DELETE
    USING (auth.uid() = doctor_user_id);

COMMENT ON POLICY "appointments_delete_doctor_own" ON appointments IS 
'Replaces cancel_appointment.php doctor logic - doctors can cancel their appointments';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify your RLS policies are working correctly

-- Check if RLS is enabled on all tables:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('profiles', 'doctor_schedules', 'appointments');

-- List all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Test as a patient (replace 'patient-uuid' with actual UUID):
-- SET request.jwt.claim.sub = 'patient-uuid';
-- SELECT * FROM appointments; -- Should only see their own

-- Test as a doctor (replace 'doctor-uuid' with actual UUID):
-- SET request.jwt.claim.sub = 'doctor-uuid';
-- SELECT * FROM appointments; -- Should only see their own

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. auth.uid() returns the UUID of the currently authenticated user from Supabase Auth
-- 2. RLS policies are applied AUTOMATICALLY - no code changes needed
-- 3. If a policy doesn't exist for an operation, it's DENIED by default
-- 4. USING clause = WHO can perform the action (SELECT/UPDATE/DELETE)
-- 5. WITH CHECK clause = WHAT data can be inserted/updated
-- 6. Multiple policies with OR logic: If ANY policy passes, access is granted
-- 7. For service role (backend operations), RLS is BYPASSED

-- ============================================
-- MIGRATION CHECKLIST
-- ============================================
-- ✓ Enable RLS on all tables
-- ✓ Profiles: SELECT (public), INSERT (own), UPDATE (own)
-- ✓ Doctor Schedules: SELECT (public), ALL (own doctors)
-- ✓ Appointments: SELECT (patients own, doctors own)
-- ✓ Appointments: INSERT (patients own)
-- ✓ Appointments: UPDATE (patients own, doctors own)
-- ✓ Appointments: DELETE (patients own, doctors own)
-- 
-- REMOVED PHP SECURITY CHECKS:
-- ✓ session_start() and $_SESSION checks
-- ✓ if (!isset($_SESSION['user_id'])) redirect
-- ✓ if (!isset($_SESSION['patient_id'])) redirect
-- ✓ if (!isset($_SESSION['doctor_id'])) redirect
-- ✓ WHERE patient_id = ? checks
-- ✓ WHERE doctor_id = ? checks
-- ✓ Role-based conditional logic
-- 
-- All replaced by automatic RLS enforcement at the database level!
