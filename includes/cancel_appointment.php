<?php
// Start session, carry over from my_appointments.php
session_start();

require_once 'db_connect.php';

if (!isset($_SESSION['patient_id'])) {
    header("Location: ../public/login.html");
    exit();
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $patient_id = $_SESSION['patient_id'];
    $appointment_id = intval($_POST['appointment_id'] ?? 0);
    
    // chec input
    if ($appointment_id <= 0) {
        header("Location: ../public/my_appointments.php?error=invalid_id");
        exit();
    }
    
    // Verify the appointment belongs to this patient before cancelling
    $verify_stmt = $conn->prepare("SELECT id FROM appointments WHERE id = ? AND patient_id = ? AND status = 'scheduled'");
    $verify_stmt->bind_param("ii", $appointment_id, $patient_id);
    $verify_stmt->execute();
    $verify_result = $verify_stmt->get_result();
    
    if ($verify_result->num_rows === 0) {
        $verify_stmt->close();
        $conn->close();
        header("Location: ../public/my_appointments.php?error=unauthorized");
        exit();
    }
    $verify_stmt->close();
    
    // Update appointment status to cancelled
    $stmt = $conn->prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?");
    $stmt->bind_param("i", $appointment_id);
    
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        header("Location: ../public/my_appointments.php?success=cancelled");
        exit();
    } else {
        $stmt->close();
        $conn->close();
        header("Location: ../public/my_appointments.php?error=cancel_failed");
        exit();
    }
} else {
    header("Location: ../public/my_appointments.php");
    exit();
}
?>
