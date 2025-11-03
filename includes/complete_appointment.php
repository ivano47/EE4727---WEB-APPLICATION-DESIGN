<?php
// Start session checking for doctor role
session_start();

require_once 'db_connect.php';

// Check if doctor is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'doctor') {
    header("Location: ../public/doctor_login.php");
    exit();
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $doctor_id = $_SESSION['user_id'];
    $appointment_id = intval($_POST['appointment_id'] ?? 0);
    
    // input check
    if ($appointment_id <= 0) {
        header("Location: ../public/doctor_dashboard.php?error=invalid_id");
        exit();
    }
    
    // Verify the appointment belongs to this doctor before processing CRUD
    $verify_stmt = $conn->prepare("SELECT id FROM appointments WHERE id = ? AND doctor_id = ? AND status = 'scheduled'");
    $verify_stmt->bind_param("ii", $appointment_id, $doctor_id);
    $verify_stmt->execute();
    $verify_result = $verify_stmt->get_result();
    
    if ($verify_result->num_rows === 0) {
        $verify_stmt->close();
        $conn->close();
        header("Location: ../public/doctor_dashboard.php?error=unauthorized");
        exit();
    }
    $verify_stmt->close();
    
    // Update appointment status to completed (same as cancel_appointment.php but changing status to completed)
    $stmt = $conn->prepare("UPDATE appointments SET status = 'completed' WHERE id = ?");
    $stmt->bind_param("i", $appointment_id);
    
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        header("Location: ../public/doctor_dashboard.php?success=completed");
        exit();
    } else {
        $stmt->close();
        $conn->close();
        header("Location: ../public/doctor_dashboard.php?error=complete_failed");
        exit();
    }
} else {
    header("Location: ../public/doctor_dashboard.php");
    exit();
}
?>
