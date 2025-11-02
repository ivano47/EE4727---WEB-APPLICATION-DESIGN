<?php
// Start session, must check if session already exist for session variables
session_start();

// Include database connection and email configuration
require_once 'db_connect.php';
require_once 'email_config.php';

// Check if user is logged in, if not redirect to login page, SESSION VARIABLE!
if (!isset($_SESSION['patient_id'])) {
    header("Location: ../public/login.html");
    exit();
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $patient_id = $_SESSION['patient_id'];
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
    
    //SQL INSERT STATEMENT HERE!
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
} else {
    // If not POST request, redirect to appt page
    header("Location: ../public/schedule.php");
    exit();
}
?>
