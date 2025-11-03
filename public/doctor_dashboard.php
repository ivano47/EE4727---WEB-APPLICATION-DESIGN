<?php
// Start session for doctor auth
session_start();

require_once '../includes/db_connect.php';

// Check if doctor is logged in (same as patient login)
if (!isset($_SESSION['doctor_id'])) {
    header("Location: doctor_login.php");
    exit();
}

$doctor_id = $_SESSION['doctor_id'];

// Get ALL appointments for this doctor
$query = "SELECT a.id, a.appointment_time, a.status, a.patient_id, p.full_name as patient_name
          FROM appointments a 
          INNER JOIN patients p ON a.patient_id = p.id 
          WHERE a.doctor_id = ? 
          ORDER BY a.appointment_time ASC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $doctor_id);
$stmt->execute();
$result = $stmt->get_result();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Doctor Dashboard - NTU Clinic</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <?php include '../includes/nav.php'; ?>

    <div class="container">
        <h1>Your Upcoming Appointments</h1>
        <p>Welcome, <?php echo htmlspecialchars($_SESSION['doctor_name']); ?>! View and manage your scheduled appointments.</p>

        <?php if (isset($_GET['success']) && $_GET['success'] === 'rescheduled'): ?>
            <p class="alert alert-success">
                ✓ Appointment rescheduled successfully! A confirmation email has been sent.
            </p>
        <?php endif; ?>

        <?php if (isset($_GET['success']) && $_GET['success'] === 'cancelled'): ?>
            <p class="alert alert-success">
                ✓ Appointment cancelled successfully.
            </p>
        <?php endif; ?>

        <table>
            <thead>
                <tr>
                    <th>Patient Name</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php
                if ($result->num_rows > 0) {
                    while ($appointment = $result->fetch_assoc()) {
                        $patient_name = htmlspecialchars($appointment['patient_name']);
                        $appointment_time = date('l, F j, Y \a\t g:i A', strtotime($appointment['appointment_time']));
                        $status = htmlspecialchars($appointment['status']);
                        $appointment_id = $appointment['id'];
                        
                        echo "<tr>";
                        echo "<td>$patient_name</td>";
                        echo "<td>$appointment_time</td>";
                        
                        if ($status === 'cancelled') {
                            echo "<td><span class='status-cancelled'>" . ucfirst($status) . "</span></td>";
                        } else {
                            echo "<td>" . ucfirst($status) . "</td>";
                        }
                        
                        echo "<td>";
                        
                        if ($status === 'scheduled') {
                            // Reschedule button
                            echo "<a href='schedule.php?reschedule_id=$appointment_id' class='btn btn-primary'>Reschedule</a>";
                            
                            // Cancel button
                            echo "<form action='../includes/cancel_appointment.php' method='POST' class='form-inline' onsubmit='return confirm(\"Are you sure you want to cancel this appointment?\");'>";
                            echo "<input type='hidden' name='appointment_id' value='$appointment_id'>";
                            echo "<input type='submit' value='Cancel' class='btn btn-cancel btn-submit'>";
                            echo "</form>";
                        } else {
                            echo "<span class='text-muted'>-</span>";
                        }
                        
                        echo "</td>";
                        echo "</tr>";
                    }
                } else {
                    echo "<tr><td colspan='4' class='text-center'>No appointments scheduled yet.</td></tr>";
                }
                
                $stmt->close();
                $conn->close();
                ?>
            </tbody>
        </table>
    </div>

    <footer>
        <p>&copy; 2025 NTU Clinic. All rights reserved.</p>
    </footer>
</body>
</html>
