-- Clinic Appointment Database Schema

-- create database
CREATE DATABASE IF NOT EXISTS clinic_appointment;
USE clinic_appointment;

-- Table: patients
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: doctors
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(50) NOT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: doctor_schedules
CREATE TABLE doctor_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_day_of_week (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: appointments
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_time DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_appointment_time (appointment_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample doctors
INSERT INTO doctors (name, specialty, bio) VALUES
('Dr. Sarah Tan', 'Family Doctor', 'Board-certified family physician with 15 years of experience in comprehensive primary care.'),
('Dr. Michael Chen', 'Family Doctor', 'Specializes in preventive medicine and chronic disease management for all ages.'),
('Dr. Emily Wong', 'Dentist', 'General dentist specializing in cosmetic dentistry and preventive oral care.'),
('Dr. Robert Lim', 'Dentist', 'Experienced in advanced dental procedures including implants and orthodontics.');

-- Insert sample doctor schedules
-- Dr. Sarah Tan (ID: 1) - Family Doctor
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time) VALUES
(1, 'Monday', '09:00:00', '17:00:00'),
(1, 'Tuesday', '09:00:00', '17:00:00'),
(1, 'Wednesday', '09:00:00', '17:00:00'),
(1, 'Thursday', '09:00:00', '17:00:00'),
(1, 'Friday', '09:00:00', '15:00:00');

-- Dr. Michael Chen (ID: 2) - Family Doctor
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time) VALUES
(2, 'Monday', '10:00:00', '18:00:00'),
(2, 'Wednesday', '10:00:00', '18:00:00'),
(2, 'Thursday', '10:00:00', '18:00:00'),
(2, 'Friday', '10:00:00', '18:00:00'),
(2, 'Saturday', '09:00:00', '13:00:00');

-- Dr. Emily Wong (ID: 3) - Dentist
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time) VALUES
(3, 'Monday', '08:00:00', '16:00:00'),
(3, 'Tuesday', '08:00:00', '16:00:00'),
(3, 'Thursday', '08:00:00', '16:00:00'),
(3, 'Friday', '08:00:00', '16:00:00'),
(3, 'Saturday', '09:00:00', '12:00:00');

-- Dr. Robert Lim (ID: 4) - Dentist
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time) VALUES
(4, 'Tuesday', '09:00:00', '17:00:00'),
(4, 'Wednesday', '09:00:00', '17:00:00'),
(4, 'Thursday', '09:00:00', '17:00:00'),
(4, 'Friday', '09:00:00', '17:00:00'),
(4, 'Saturday', '10:00:00', '14:00:00');
