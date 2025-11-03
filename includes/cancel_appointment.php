<?php
// Start session, carry over from my_appointments.php or doctor_dashboard.php
session_start();

require_once 'db_connect.php';

// user should be logged in
if (!isset($_SESSION['user_id']) || empty($_SESSION['role'])) {
    header("Location: ../public/login.php");
    exit();
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_SESSION['user_id'];
    $appointment_id = intval($_POST['appointment_id'] ?? 0);
    
    // chec input
    if ($appointment_id <= 0) {
        $redirect_page = ($_SESSION['role'] === 'doctor') ? 'doctor_dashboard.php' : 'my_appointments.php';
        header("Location: ../public/$redirect_page?error=invalid_id");
        exit();
    }
    
    // ensure appt belongs to this user before cancelling
    if ($_SESSION['role'] === 'patient') {
        $verify_stmt = $conn->prepare("SELECT id FROM appointments WHERE id = ? AND patient_id = ? AND status = 'scheduled'");
        $verify_stmt->bind_param("ii", $appointment_id, $user_id);
    } elseif ($_SESSION['role'] === 'doctor') {
        $verify_stmt = $conn->prepare("SELECT id FROM appointments WHERE id = ? AND doctor_id = ? AND status = 'scheduled'");
        $verify_stmt->bind_param("ii", $appointment_id, $user_id);
    } else {
        $conn->close();
        header("Location: ../public/login.php?error=invalid_role");
        exit();
    }
    
    $verify_stmt->execute();
    $verify_result = $verify_stmt->get_result();
    
    if ($verify_result->num_rows === 0) {
        $verify_stmt->close();
        $conn->close();
        $redirect_page = ($_SESSION['role'] === 'doctor') ? 'doctor_dashboard.php' : 'my_appointments.php';
        header("Location: ../public/$redirect_page?error=unauthorized");
        exit();
    }
    $verify_stmt->close();
    
    // Update appointment status to cancelled
    $stmt = $conn->prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?");
    $stmt->bind_param("i", $appointment_id);
    
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        $redirect_page = ($_SESSION['role'] === 'doctor') ? 'doctor_dashboard.php' : 'my_appointments.php';
        header("Location: ../public/$redirect_page?success=cancelled");
        exit();
    } else {
        $stmt->close();
        $conn->close();
        $redirect_page = ($_SESSION['role'] === 'doctor') ? 'doctor_dashboard.php' : 'my_appointments.php';
        header("Location: ../public/$redirect_page?error=cancel_failed");
        exit();
    }
} else {
    $redirect_page = ($_SESSION['role'] === 'doctor') ? 'doctor_dashboard.php' : 'my_appointments.php';
    header("Location: ../public/$redirect_page");
    exit();
}
?>
