<?php
// Start session for doctor authentication
session_start();
require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // form data from $_POST
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    // Server-side validation
    // Check if any fields are empty
    if (empty($email) || empty($password)) {
        header("Location: ../public/doctor_login.php?error=empty_fields");
        exit();
    }
    // SQL SELECT statement to find doctor by email
    $stmt = $conn->prepare("SELECT id, name, email, password FROM doctors WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Check if doctor exists
    if ($result->num_rows === 1) {
        $doctor = $result->fetch_assoc();
        
        // Verify password using password_verify() since it's hashed
        if (password_verify($password, $doctor['password'])) {
            // Login successful - store doctor data in session
            $_SESSION['role'] = 'doctor';
            $_SESSION['doctor_id'] = $doctor['id'];
            $_SESSION['user_id'] = $doctor['id'];
            $_SESSION['doctor_name'] = $doctor['name'];
            
            $stmt->close();
            $conn->close();
            // Redirect to doctor dashboard
            header("Location: ../public/doctor_dashboard.php");
            exit();
        } else {
            // incorrect pw
            $stmt->close();
            $conn->close();
            header("Location: ../public/doctor_login.php?error=invalid_credentials");
            exit();
        }
    } else {
        // not found
        $stmt->close();
        $conn->close();
        header("Location: ../public/doctor_login.php?error=invalid_credentials");
        exit();
    }
} else {
    // If not POST request, redirect to doctor login
    header("Location: ../public/doctor_login.php");
    exit();
}
?>
