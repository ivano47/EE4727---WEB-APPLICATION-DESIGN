<?php
// Contact form for homepage messages

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // obt form data
    $first_name = trim($_POST['first_name'] ?? '');
    $last_name = trim($_POST['last_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');
    
    // check inputs
    if (empty($first_name) || empty($last_name) || empty($email) || empty($subject) || empty($message)) {
        header("Location: ../public/index.php?error=empty_fields#contact");
        exit();
    }
    // check email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: ../public/index.php?error=invalid_email#contact");
        exit();
    }
    // Log the message to a file (since were in development, think can send to f31ee email later?🛠️)
    $log_entry = "=== CONTACT FORM SUBMISSION ===\n";
    $log_entry .= "Date: " . date('Y-m-d H:i:s') . "\n";
    $log_entry .= "Name: $first_name $last_name\n";
    $log_entry .= "Email: $email\n";
    $log_entry .= "Subject: $subject\n";
    $log_entry .= "Message:\n$message\n";
    $log_entry .= "================================\n\n";
    
    if (!file_exists('../logs')) {
        mkdir('../logs', 0777, true);
    }
    
    error_log($log_entry, 3, "../logs/contact_log.txt");

    // Redirect with success message (NOT SHOWING UP atm?🛠️ ️)
    header("Location: ../public/index.php?success=message_sent#contact");
    exit();
} else {
    header("Location: ../public/index.php");
    exit();
}
?>
