<?php
// Start session, think no user session variables are set yet since its login...
session_start();
require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data from $_POST
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    // Server-side validation
    // Check if any fields are empty
    if (empty($email) || empty($password)) {
        header("Location: ../public/login.php?error=empty_fields");
        exit();
    }
    
    //SQL SELECT statement to find patient email
    $stmt = $conn->prepare("SELECT id, full_name, password FROM patients WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Check if user exist or not
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        // Verify password using password_verify() since its hashed
        if (password_verify($password, $user['password'])) {
            // Login successful sostore user data in session
            $_SESSION['patient_id'] = $user['id'];
            $_SESSION['full_name'] = $user['full_name'];
            
            $stmt->close();
            $conn->close();
            // Redirect to my_appointments.php
            header("Location: ../public/my_appointments.php");
            exit();
        } else {
            // Password incorrect
            $stmt->close();
            $conn->close();
            header("Location: ../public/login.php?error=invalid_credentials");
            exit();
        }
    } else {
        // User not found
        $stmt->close();
        $conn->close();
        header("Location: ../public/login.php?error=invalid_credentials");
        exit();
    }
} else {
    // If not POST request, redirect to login page
    header("Location: ../public/login.php");
    exit();
}
?>
