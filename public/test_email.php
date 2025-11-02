<?php
// Simple email test script for Mercury Mail
// Access this via: http://localhost/IE4727/PROJ_BASE/public/test_email.php

$test_to = "f32ee@localhost";
$test_from = "f31ee@localhost";
$test_subject = "Test Email from PHP";
$test_message = "This is a test email sent at " . date('Y-m-d H:i:s');

$headers = "From: NTU Clinic <$test_from>\r\n";
$headers .= "Reply-To: $test_from\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

echo "<h2>Email Test</h2>";
echo "<p><strong>From:</strong> $test_from</p>";
echo "<p><strong>To:</strong> $test_to</p>";
echo "<p><strong>Subject:</strong> $test_subject</p>";
echo "<hr>";

// Try to send email
$result = mail($test_to, $test_subject, $test_message, $headers);

if ($result) {
    echo "<p style='color: green;'><strong>✓ Email sent successfully!</strong></p>";
    echo "<p>Check Mercury Mail or the mailbox for f32ee@localhost</p>";
} else {
    echo "<p style='color: red;'><strong>✗ Email failed to send</strong></p>";
    echo "<p>Possible issues:</p>";
    echo "<ul>";
    echo "<li>Mercury Mail is not running</li>";
    echo "<li>SMTP server not accepting connections on port 25</li>";
    echo "<li>User mailboxes not created in Mercury</li>";
    echo "</ul>";
}

echo "<hr>";
echo "<h3>PHP Mail Configuration:</h3>";
echo "<p><strong>SMTP:</strong> " . ini_get('SMTP') . "</p>";
echo "<p><strong>smtp_port:</strong> " . ini_get('smtp_port') . "</p>";
echo "<p><strong>sendmail_from:</strong> " . ini_get('sendmail_from') . "</p>";

echo "<hr>";
echo "<h3>How to check your email in Mercury:</h3>";
echo "<ol>";
echo "<li>Open Mercury Mail from XAMPP Control Panel</li>";
echo "<li>Click 'File' → 'Read local mail'</li>";
echo "<li>Select user 'f32ee' and enter password</li>";
echo "<li>Check the inbox for the test email</li>";
echo "</ol>";
?>
