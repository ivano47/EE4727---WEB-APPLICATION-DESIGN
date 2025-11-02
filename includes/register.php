<?php
// Include database connection... same as login
require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data from $_POST
    $full_name = trim($_POST['full_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    
    // Server-side validation
    // Check if ANY fields are empty
    if (empty($full_name) || empty($email) || empty($password) || empty($confirm_password)) {
        header("Location: ../public/register.php?error=empty_fields");
        exit();
    }
    
    // Check if passwords match
    if ($password !== $confirm_password) {
        header("Location: ../public/register.php?error=password_mismatch");
        exit();
    }
    
    // check email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: ../public/register.php?error=invalid_email");
        exit();
    }
    
    // check if email already exists
    $check_stmt = $conn->prepare("SELECT id FROM patients WHERE email = ?");
    $check_stmt->bind_param("s", $email);
    $check_stmt->execute();
    $check_stmt->store_result();
    
    if ($check_stmt->num_rows > 0) {
        $check_stmt->close();
        header("Location: ../public/register.php?error=email_exists");
        exit();
    }
    $check_stmt->close();
    
    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // SQL INSERT statement
    $stmt = $conn->prepare("INSERT INTO patients (full_name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $full_name, $email, $hashed_password);
    
    // RUN IT!
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        // Redirect to login page on success
        header("Location: ../public/login.php?success=registered");
        exit();
    } else {
        $stmt->close();
        $conn->close();
        // Redirect back with error
        header("Location: ../public/register.php?error=registration_failed");
        exit();
    }
} else {
    // If not POST request, redirect to register page
    header("Location: ../public/register.php");
    exit();
}
?>
