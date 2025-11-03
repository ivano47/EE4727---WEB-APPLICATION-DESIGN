<?php
// Setup script to create/update doctor login credentials

require_once '../includes/db_connect.php';

echo "<h2>Doctor Login Setup</h2>";
echo "<p>This script will set up login credentials for all doctors.</p>";
echo "<hr>";

// Define doctors with their credentials
$doctors = [
    [
        'email' => 's.tan@ntu.clinic',
        'password' => 'doctor123', // plain text here... it will be hashed
        'name' => 'Dr. Sarah Tan'
    ],
    [
        'email' => 'm.chen@ntu.clinic',
        'password' => 'doctor123',
        'name' => 'Dr. Michael Chen'
    ],
    [
        'email' => 'e.wong@ntu.clinic',
        'password' => 'doctor123',
        'name' => 'Dr. Emily Wong'
    ],
    [
        'email' => 'r.lim@ntu.clinic',
        'password' => 'doctor123',
        'name' => 'Dr. Robert Lim'
    ]
];

echo "<h3>Setting up credentials:</h3>";
echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
echo "<tr><th>Doctor Name</th><th>Email</th><th>Password (plain)</th><th>Status</th></tr>";

foreach ($doctors as $doctor) {
    $email = $doctor['email'];
    $plain_password = $doctor['password'];
    $hashed_password = password_hash($plain_password, PASSWORD_DEFAULT);
    $name = $doctor['name'];
    
    // Check if doctor exists with this email
    $check_stmt = $conn->prepare("SELECT id FROM doctors WHERE email = ?");
    $check_stmt->bind_param("s", $email);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows > 0) {
        // Update existing doctor
        $update_stmt = $conn->prepare("UPDATE doctors SET password = ? WHERE email = ?");
        $update_stmt->bind_param("ss", $hashed_password, $email);
        
        if ($update_stmt->execute()) {
            $status = "<span style='color: green;'>✓ Password updated</span>";
        } else {
            $status = "<span style='color: red;'>✗ Update failed: " . $update_stmt->error . "</span>";
        }
        $update_stmt->close();
    } else {
        // Doctor doesn't exist - this shouldn't happen if database was set up correctly 🥹
        $status = "<span style='color: orange;'>⚠ Doctor not found in database</span>";
    }
    
    $check_stmt->close();
    
    echo "<tr>";
    echo "<td>$name</td>";
    echo "<td>$email</td>";
    echo "<td>$plain_password</td>";
    echo "<td>$status</td>";
    echo "</tr>";
}

echo "</table>";

$conn->close();

echo "<hr>";
echo "<h3>Doctor Login Information:</h3>";
echo "<li><strong>Dr. Sarah Tan:</strong> s.tan@ntu.clinic / doctor123</li>";
echo "<li><strong>Dr. Michael Chen:</strong> m.chen@ntu.clinic / doctor123</li>";
echo "<li><strong>Dr. Emily Wong:</strong> e.wong@ntu.clinic / doctor123</li>";
echo "<li><strong>Dr. Robert Lim:</strong> r.lim@ntu.clinic / doctor123</li>";
echo "</ul>";

echo "<hr>";
echo "<p><strong>Note:</strong> Passwords are hashed in the database using PHP's password_hash() function.</p>";
?>
