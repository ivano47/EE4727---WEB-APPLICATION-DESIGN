<?php
// Contact form handler - supports both index.php and contact.php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // obt form data
    $first_name = trim($_POST['first_name'] ?? '');
    $last_name = trim($_POST['last_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');
    $redirect_page = $_POST['redirect_page'] ?? 'contact'; // default to contact.php
    
    // return back to where form submited from
    if ($redirect_page === 'index') {
        $error_url = "../public/index.php?error=";
        $success_url = "../public/index.php?success=message_sent#contact";
        $default_url = "../public/index.php#contact";
    } else {
        $error_url = "../public/contact.php?error=";
        $success_url = "../public/contact.php?success=message_sent";
        $default_url = "../public/contact.php";
    }
    
    // chec inputs
    if (empty($first_name) || empty($last_name) || empty($email) || empty($subject) || empty($message)) {
        header("Location: {$error_url}empty_fields" . ($redirect_page === 'index' ? '#contact' : ''));
        exit();
    }
    
    // check email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: {$error_url}invalid_email" . ($redirect_page === 'index' ? '#contact' : ''));
        exit();
    }
    
    // Log the message to a file OR email to f31ee (the clinic email))???🛠️
    $log_entry = "=== CONTACT FORM SUBMISSION ===\n";
    $log_entry .= "Date: " . date('Y-m-d H:i:s') . "\n";
    $log_entry .= "Source: " . ($redirect_page === 'index' ? 'Homepage' : 'Contact Page') . "\n";
    $log_entry .= "Name: $first_name $last_name\n";
    $log_entry .= "Email: $email\n";
    $log_entry .= "Subject: $subject\n";
    $log_entry .= "Message:\n$message\n";
    $log_entry .= "================================\n\n";
    
    if (!file_exists('../logs')) {
        mkdir('../logs', 0777, true);
    }
    
    error_log($log_entry, 3, "../logs/contact_log.txt");

    // Redirect with success message
    header("Location: $success_url");
    exit();
} else {
    // If not POST request, redirect to contact page
    header("Location: ../public/contact.php");
    exit();
}
?>
