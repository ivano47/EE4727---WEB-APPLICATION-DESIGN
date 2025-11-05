-- Add rescheduled_by field to appointments table
-- This tracks who rescheduled the appointment: 'patient' or 'doctor'

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS rescheduled_by VARCHAR(20);

COMMENT ON COLUMN appointments.rescheduled_by IS 'Tracks who rescheduled the appointment: patient or doctor';
