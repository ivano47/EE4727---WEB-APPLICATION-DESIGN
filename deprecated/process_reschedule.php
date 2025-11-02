<?php
session_start();

// Include database connection and email configuration
require_once 'db_connect.php';
require_once 'email_config.php';

if (!isset($_SESSION['patient_id'])) {
    header("Location: ../public/login.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $patient_id = $_SESSION['patient_id'];
    $appointment_id = intval($_POST['appointment_id'] ?? 0);
    $new_time = $_POST['new_time'] ?? '';
    
    // check inputs
    if ($appointment_id <= 0 || empty($new_time)) {
        header("Location: ../public/my_appointments.php?error=invalid_data");
        exit();
    }
    
    // Verify the appointment belongs to this patient
    $verify_stmt = $conn->prepare("SELECT doctor_id FROM appointments WHERE id = ? AND patient_id = ? AND status = 'scheduled'");
    $verify_stmt->bind_param("ii", $appointment_id, $patient_id);
    $verify_stmt->execute();
    $verify_result = $verify_stmt->get_result();
    
    if ($verify_result->num_rows === 0) {
        $verify_stmt->close();
        $conn->close();
        header("Location: ../public/my_appointments.php?error=unauthorized");
        exit();
    }
    
    $appointment_data = $verify_result->fetch_assoc();
    $doctor_id = $appointment_data['doctor_id'];
    $verify_stmt->close();
    
    // Check if new time slot is available for the samy doc
    $check_stmt = $conn->prepare("SELECT id FROM appointments WHERE doctor_id = ? AND appointment_time = ? AND status = 'scheduled' AND id != ?");
    $check_stmt->bind_param("isi", $doctor_id, $new_time, $appointment_id);
    $check_stmt->execute();
    $check_stmt->store_result();
    
    if ($check_stmt->num_rows > 0) {
        $check_stmt->close();
        $conn->close();
        header("Location: ../public/my_appointments.php?error=slot_taken");
        exit();
    }
    $check_stmt->close();
    
    // Update appointment time
    $update_stmt = $conn->prepare("UPDATE appointments SET appointment_time = ? WHERE id = ?");
    $update_stmt->bind_param("si", $new_time, $appointment_id);
    
    if ($update_stmt->execute()) {
        $update_stmt->close();
        
        // Get details for email notification
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
            
            $formatted_time = date('l, F j, Y \a\t g:i A', strtotime($new_time));
            
            $subject = "Appointment Rescheduled - NTU Clinic";
            $message = "Dear $patient_name,\n\n";
            $message .= "Your appointment has been successfully rescheduled.\n\n";
            $message .= "Updated Appointment Details:\n";
            $message .= "Doctor: $doctor_name ($specialty)\n";
            $message .= "New Date & Time: $formatted_time\n\n";
            $message .= "Please arrive 10 minutes early for check-in.\n\n";
            $message .= "If you need to reschedule again, please visit our website.\n\n";
            $message .= "Thank you for choosing NTU Clinic!\n\n";
            $message .= "Best regards,\n";
            $message .= "NTU Clinic Team";
            
            // Send email notification
            send_clinic_email($patient_email, $subject, $message, $patient_name);
        }
        
        $email_query->close();
        $conn->close();
        
        // Redirect to my_appointments.php
        header("Location: ../public/my_appointments.php?success=rescheduled");
        exit();
    } else {
        $update_stmt->close();
        $conn->close();
        header("Location: ../public/my_appointments.php?error=reschedule_failed");
        exit();
    }
} else {
    header("Location: ../public/my_appointments.php");
    exit();
}
?>
