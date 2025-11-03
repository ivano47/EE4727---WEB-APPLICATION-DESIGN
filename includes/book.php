<?php
// Start session, must check if session already exist for session variables
session_start();

// Include database connection and email configuration
require_once 'db_connect.php';
require_once 'email_config.php';

// Check if user is logged in, if not redirect to login page
if (!isset($_SESSION['user_id']) || empty($_SESSION['role'])) {
    header("Location: ../public/login.php");
    exit();
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get user ID based on role
    $user_id = $_SESSION['user_id'];
    $patient_id = ($_SESSION['role'] === 'patient') ? $_SESSION['patient_id'] : null;
    $doctor_id = intval($_POST['doctor_id'] ?? 0);
    $appointment_time = $_POST['appointment_time'] ?? '';
    
    if ($doctor_id <= 0 || empty($appointment_time)) {
        header("Location: ../public/schedule.php?error=invalid_data");
        exit();
    }
    
    // Check if slot is still available
    $check_stmt = $conn->prepare("SELECT id FROM appointments WHERE doctor_id = ? AND appointment_time = ? AND status = 'scheduled'");
    $check_stmt->bind_param("is", $doctor_id, $appointment_time);
    $check_stmt->execute();
    $check_stmt->store_result();
    
    if ($check_stmt->num_rows > 0) {
        $check_stmt->close();
        $conn->close();
        header("Location: ../public/schedule.php?error=slot_taken");
        exit();
    }
    $check_stmt->close();
    
    // Check if this is a reschedule or new appointment
    $reschedule_id = intval($_POST['reschedule_id'] ?? 0);
    
    if ($reschedule_id > 0) {
        // This is a reschedule - UPDATE existing appointment NOT INSERT!!
        // Handle differently based on user role
        if ($_SESSION['role'] === 'patient') {
            // Patient rescheduling their own appointment
            $stmt = $conn->prepare("UPDATE appointments SET doctor_id = ?, appointment_time = ? WHERE id = ? AND patient_id = ?");
            $stmt->bind_param("isii", $doctor_id, $appointment_time, $reschedule_id, $patient_id);
        } elseif ($_SESSION['role'] === 'doctor') {
            // Doctor rescheduling an appointment they own
            // First, get the patient_id for this appointment
            $get_patient_stmt = $conn->prepare("SELECT patient_id FROM appointments WHERE id = ? AND doctor_id = ?");
            $get_patient_stmt->bind_param("ii", $reschedule_id, $user_id);
            $get_patient_stmt->execute();
            $get_patient_result = $get_patient_stmt->get_result();
            
            if ($get_patient_result->num_rows === 1) {
                $apt_data = $get_patient_result->fetch_assoc();
                $patient_id = $apt_data['patient_id'];
            }
            $get_patient_stmt->close();
            
            // Now update the appointment
            $stmt = $conn->prepare("UPDATE appointments SET doctor_id = ?, appointment_time = ? WHERE id = ? AND doctor_id = ?");
            $stmt->bind_param("isii", $doctor_id, $appointment_time, $reschedule_id, $user_id);
        } else {
            // Invalid role
            $conn->close();
            header("Location: ../public/schedule.php?error=invalid_role");
            exit();
        }
        
        // run it
        if ($stmt->execute()) {
            $stmt->close();
            
            //patient email and appointment details for email
            $email_query = $conn->prepare("SELECT p.email, p.full_name, d.name as doctor_name, d.specialty 
                                           FROM patients p, doctors d 
                                           WHERE p.id = ? AND d.id = ?");
            $email_query->bind_param("ii", $patient_id, $doctor_id);
            $email_query->execute();
            $email_result = $email_query->get_result();
            
            if ($email_result->num_rows === 1) {
                $details = $email_result->fetch_assoc();
                $patient_email = $details['email'];
                $patient_name = $details['full_name'];
                $doctor_name = $details['doctor_name'];
                $specialty = $details['specialty'];
                
                // Format appointment time (idk why but it returns unix timestamp sometimes ??)
                $formatted_time = date('l, F j, Y \a\t g:i A', strtotime($appointment_time));
                
                // Prepare email
                $subject = "Appointment Rescheduled - NTU Clinic";
                $message = "Dear $patient_name,\n\n";
                $message .= "Your appointment has been successfully rescheduled.\n\n";
                $message .= "New Appointment Details:\n";
                $message .= "Doctor: $doctor_name ($specialty)\n";
                $message .= "Date & Time: $formatted_time\n\n";
                $message .= "Please arrive 10 minutes early for check-in.\n\n";
                $message .= "If you need to reschedule again, please visit our website.\n\n";
                $message .= "Thank you for choosing NTU Clinic!\n\n";
                $message .= "Best regards,\n";
                $message .= "NTU Clinic Team";
                
                // Send email function from email_config.php
                send_clinic_email($patient_email, $subject, $message, $patient_name);
            }
            
            $email_query->close();
            $conn->close();
            
            // Redirect based on user role
            if ($_SESSION['role'] === 'doctor') {
                header("Location: ../public/doctor_dashboard.php?success=rescheduled");
            } else {
                header("Location: ../public/my_appointments.php?success=rescheduled");
            }
            exit();
        } else {
            $stmt->close();
            $conn->close();
            header("Location: ../public/schedule.php?error=booking_failed");
            exit();
        }
    } else {
        // This is a new appointment - INSERT new record
        $stmt = $conn->prepare("INSERT INTO appointments (patient_id, doctor_id, appointment_time, status) VALUES (?, ?, ?, 'scheduled')");
        $stmt->bind_param("iis", $patient_id, $doctor_id, $appointment_time);
        
        // run it
        if ($stmt->execute()) {
            $stmt->close();
            
            //patient email and appointment details for email
            $email_query = $conn->prepare("SELECT p.email, p.full_name, d.name as doctor_name, d.specialty 
                                           FROM patients p, doctors d 
                                           WHERE p.id = ? AND d.id = ?");
            $email_query->bind_param("ii", $patient_id, $doctor_id);
            $email_query->execute();
            $email_result = $email_query->get_result();
            
            if ($email_result->num_rows === 1) {
                $details = $email_result->fetch_assoc();
                $patient_email = $details['email'];
                $patient_name = $details['full_name'];
                $doctor_name = $details['doctor_name'];
                $specialty = $details['specialty'];
                
                // Format appointment time (idk why but it returns unix timestamp sometimes ??)
                $formatted_time = date('l, F j, Y \a\t g:i A', strtotime($appointment_time));
                
                // Prepare email
                $subject = "Appointment Confirmation - NTU Clinic";
                $message = "Dear $patient_name,\n\n";
                $message .= "Your appointment has been successfully scheduled.\n\n";
                $message .= "Appointment Details:\n";
                $message .= "Doctor: $doctor_name ($specialty)\n";
                $message .= "Date & Time: $formatted_time\n\n";
                $message .= "Please arrive 10 minutes early for check-in.\n\n";
                $message .= "If you need to reschedule, please visit our website.\n\n";
                $message .= "Thank you for choosing NTU Clinic!\n\n";
                $message .= "Best regards,\n";
                $message .= "NTU Clinic Team";
                
                // Send email function from email_config.php
                send_clinic_email($patient_email, $subject, $message, $patient_name);
            }
            
            $email_query->close();
            $conn->close();
            
            // Redirect to my_appointments.php
            header("Location: ../public/my_appointments.php?success=booked");
            exit();
        } else {
            $stmt->close();
            $conn->close();
            header("Location: ../public/schedule.php?error=booking_failed");
            exit();
        }
    }
} else {
    // If not POST request, redirect to appt page
    header("Location: ../public/schedule.php");
    exit();
}
?>
