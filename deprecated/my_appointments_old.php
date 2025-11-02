<?php
// Start session, SHOULD already have superglobal $_SESSION
session_start();

require_once '../includes/db_connect.php';

// Check if user is logged in... should already be logged in to view this page
if (!isset($_SESSION['patient_id'])) {
    header("Location: login.php");
    exit();
}

$patient_id = $_SESSION['patient_id'];

// Get ALL appointments for this patient
$query = "SELECT a.id, a.appointment_time, a.status, a.doctor_id, d.name as doctor_name, d.specialty 
          FROM appointments a 
          INNER JOIN doctors d ON a.doctor_id = d.id 
          WHERE a.patient_id = ? 
          ORDER BY a.appointment_time ASC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $patient_id);
$stmt->execute();
$result = $stmt->get_result();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Appointments - NTU Clinic</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/table.css">
</head>
<body>
    <?php include '../includes/nav.php'; ?>

    <div class="container">
        <h1>My Upcoming Appointments</h1>
        <p>Welcome, <?php echo htmlspecialchars($_SESSION['full_name']); ?>! View and manage your scheduled appointments.</p>

        <?php if (isset($_GET['success']) && $_GET['success'] === 'rescheduled'): ?>
            <p class="alert alert-success">
                ✓ Appointment rescheduled successfully! A confirmation email has been sent.
            </p>
        <?php endif; ?>

        <?php if (isset($_GET['success']) && $_GET['success'] === 'booked'): ?>
            <p class="alert alert-success">
                ✓ Appointment booked successfully! A confirmation email has been sent.
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
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php
                if ($result->num_rows > 0) {
                    while ($appointment = $result->fetch_assoc()) {
                        $doctor_name = htmlspecialchars($appointment['doctor_name']);
                        $specialty = htmlspecialchars($appointment['specialty']);
                        $appointment_time = date('l, F j, Y \a\t g:i A', strtotime($appointment['appointment_time']));
                        $status = htmlspecialchars($appointment['status']);
                        $appointment_id = $appointment['id'];
                        $doctor_id = $appointment['doctor_id'];
                        
                        echo "<tr>";
                        echo "<td>$doctor_name</td>";
                        echo "<td>$specialty</td>";
                        echo "<td>$appointment_time</td>";
                        echo "<td>" . ucfirst($status) . "</td>";
                        echo "<td>";
                        
                        if ($status === 'scheduled') {
                            // Reschedule button
                            echo "<a href='reschedule.php?appointment_id=$appointment_id&doctor_id=$doctor_id' class='btn btn-primary'>Reschedule</a>";
                            
                            // Cancel button
                            echo "<form action='../includes/cancel_appointment.php' method='POST' class='form-inline' onsubmit='return confirm(\"Are you sure you want to cancel this appointment?\");'>";
                            echo "<input type='hidden' name='appointment_id' value='$appointment_id'>";
                            echo "<input type='submit' value='Cancel' class='btn btn-danger btn-submit'>";
                            echo "</form>";
                        } else {
                            echo "<span class='text-muted'>-</span>";
                        }
                        
                        echo "</td>";
                        echo "</tr>";
                    }
                } else {
                    echo "<tr><td colspan='5' class='text-center'>No appointments scheduled yet. <a href='schedule.php'>Book an appointment</a></td></tr>";
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

