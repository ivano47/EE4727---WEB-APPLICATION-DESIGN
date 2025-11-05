-- Add cancelled_by field to track who cancelled the appointment
-- Values: 'patient', 'doctor', or NULL

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(20);

-- Add comment to explain the column
COMMENT ON COLUMN appointments.cancelled_by IS 'Tracks who cancelled the appointment: patient or doctor';

-- Update existing cancelled appointments to NULL (unknown)
-- You can manually update these if you have historical data
