<?php
// Start session
session_start();

require_once '../includes/db_connect.php';

if (!isset($_SESSION['patient_id'])) {
    header("Location: login.php");
    exit();
}

// Get appointment and doctor IDs from URL GET
$appointment_id = intval($_GET['appointment_id'] ?? 0);
$doctor_id = intval($_GET['doctor_id'] ?? 0);

if ($appointment_id <= 0 || $doctor_id <= 0) {
    header("Location: my_appointments.php?error=invalid_request");
    exit();
}

$appointment_query = $conn->prepare("SELECT a.id, a.appointment_time, d.name as doctor_name, d.specialty 
                                     FROM appointments a 
                                     INNER JOIN doctors d ON a.doctor_id = d.id 
                                     WHERE a.id = ? AND a.patient_id = ? AND a.status = 'scheduled'");
$appointment_query->bind_param("ii", $appointment_id, $_SESSION['patient_id']);
$appointment_query->execute();
$appointment_result = $appointment_query->get_result();

if ($appointment_result->num_rows === 0) {
    $appointment_query->close();
    $conn->close();
    header("Location: my_appointments.php?error=not_found");
    exit();
}

$current_appointment = $appointment_result->fetch_assoc();
$appointment_query->close();

// Get doctor's schedule for the SAME doctor (to reschedule only with the same doctor sounds more reasonable...)
$schedule_query = "SELECT d.id, d.name, d.specialty, ds.day_of_week, ds.start_time, ds.end_time 
                   FROM doctors d 
                   INNER JOIN doctor_schedules ds ON d.id = ds.doctor_id 
                   WHERE d.id = ?
                   ORDER BY ds.day_of_week, ds.start_time";
$schedule_stmt = $conn->prepare($schedule_query);
$schedule_stmt->bind_param("i", $doctor_id);
$schedule_stmt->execute();
$schedule_result = $schedule_stmt->get_result();

// Get all booked appointments for this doctor
$booked_query = "SELECT appointment_time FROM appointments WHERE doctor_id = ? AND status = 'scheduled' AND id != ?";
$booked_stmt = $conn->prepare($booked_query);
$booked_stmt->bind_param("ii", $doctor_id, $appointment_id);
$booked_stmt->execute();
$booked_result = $booked_stmt->get_result();

// Store booked appointments in an array
$booked_slots = [];
while ($booked = $booked_result->fetch_assoc()) {
    $booked_slots[$booked['appointment_time']] = true;
}
$booked_stmt->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reschedule Appointment - NTU Clinic</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/table.css">
</head>
<body>
    <?php include '../includes/nav.php'; ?>

    <div class="container">
        <h1>Reschedule Appointment</h1>
        <p>Select a new time slot with <?php echo htmlspecialchars($current_appointment['doctor_name']); ?></p>

        <div class="alert alert-info">
            <h3>Current Appointment</h3>
            <p><strong>Doctor:</strong> <?php echo htmlspecialchars($current_appointment['doctor_name']); ?> (<?php echo htmlspecialchars($current_appointment['specialty']); ?>)</p>
            <p><strong>Current Time:</strong> <?php echo date('l, F j, Y \a\t g:i A', strtotime($current_appointment['appointment_time'])); ?></p>
        </div>

        <h2>Available Time Slots</h2>
        <table>
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Date & Time</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php
                if ($schedule_result->num_rows > 0) {
                    // Get current date and next 30 days
                    $start_date = new DateTime();
                    $end_date = new DateTime();
                    $end_date->modify('+30 days');
                    
                    $slots_found = false;
                    
                    while ($schedule = $schedule_result->fetch_assoc()) {
                        $day_of_week = $schedule['day_of_week'];
                        $start_time = $schedule['start_time'];
                        $end_time = $schedule['end_time'];
                        
                        $time_start = new DateTime($start_time);
                        $time_end = new DateTime($end_time);
                        
                        // Find occurrences of this day
                        $current = clone $start_date;
                        while ($current <= $end_date) {
                            if ($current->format('l') === $day_of_week && $current >= $start_date) {
                                // Generate hourly slots
                                $slot_time = clone $time_start;
                                while ($slot_time < $time_end) {
                                    $appointment_datetime = $current->format('Y-m-d') . ' ' . $slot_time->format('H:i:s');
                                    $display_date = $current->format('M d, Y');
                                    $display_time = $slot_time->format('g:i A');
                                    
                                    // Check if slot is available
                                    if (!isset($booked_slots[$appointment_datetime])) {
                                        $slots_found = true;
                                        echo "<tr>";
                                        echo "<td>$day_of_week</td>";
                                        echo "<td>$display_date at $display_time</td>";
                                        echo "<td>";
                                        echo "<form action='../includes/process_reschedule.php' method='POST' class='form-inline-block'>";
                                        echo "<input type='hidden' name='appointment_id' value='$appointment_id'>";
                                        echo "<input type='hidden' name='new_time' value='$appointment_datetime'>";
                                        echo "<input type='submit' value='Select' class='btn btn-submit'>";
                                        echo "</form>";
                                        echo "</td>";
                                        echo "</tr>";
                                    }
                                    
                                    $slot_time->modify('+1 hour');
                                }
                            }
                            $current->modify('+1 day');
                        }
                    }
                    
                    if (!$slots_found) {
                        echo "<tr><td colspan='3' class='text-center'>No available slots found for this doctor.</td></tr>";
                    }
                } else {
                    echo "<tr><td colspan='3' class='text-center'>No schedule available.</td></tr>";
                }
                
                $schedule_stmt->close();
                $conn->close();
                ?>
            </tbody>
        </table>

        <p class="mt-20">
            <a href="my_appointments.php" class="btn-link">← Back to My Appointments</a>
        </p>
    </div>
</body>
</html>

