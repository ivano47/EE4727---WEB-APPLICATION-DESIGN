<?php
// Email configuration for the clinic system

// Set to true to enable actual email sending, false for testing/development (through logging)
define('ENABLE_EMAIL', true);

// Mercury Mail settings (for local XAMPP environment)
define('SMTP_HOST', 'localhost');
define('SMTP_PORT', 25);
define('FROM_EMAIL', 'f31ee@localhost');
define('FROM_NAME', 'NTU Clinic');

// Function to send email with fallback for testing
function send_clinic_email($to, $subject, $message, $patient_name = '') {
    if (ENABLE_EMAIL) {
        $headers = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\n";
        $headers .= "Reply-To: " . FROM_EMAIL . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();
        
        $success = mail($to, $subject, $message, $headers);
        
        $log_message = date('Y-m-d H:i:s') . " - Email " . ($success ? "sent" : "failed") . " to: $to\n";
        error_log($log_message, 3, "../logs/email_log.txt");
        
        return $success;
    } else {
        $log_message = "=== EMAIL LOG ===\n";
        $log_message .= "Date: " . date('Y-m-d H:i:s') . "\n";
        $log_message .= "To: $to\n";
        $log_message .= "Subject: $subject\n";
        $log_message .= "Message:\n$message\n";
        $log_message .= "==================\n\n";
        
        // Create logs directory if it doesn't exist
        if (!file_exists('../logs')) {
            mkdir('../logs', 0777, true);
        }
        
        error_log($log_message, 3, "../logs/email_log.txt");
        //test must return true -_-
        return true;
    }
}
?>
