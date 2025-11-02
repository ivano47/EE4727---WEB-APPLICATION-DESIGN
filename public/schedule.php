<?php
// Start session
session_start();

// Include database connection
require_once '../includes/db_connect.php';

// Check if user is logged in
if (!isset($_SESSION['patient_id'])) {
    header("Location: login.html");
    exit();
}

// Get all doctors with their schedules
$doctors_query = "SELECT d.id, d.name, d.specialty, ds.day_of_week, ds.start_time, ds.end_time 
                  FROM doctors d 
                  INNER JOIN doctor_schedules ds ON d.id = ds.doctor_id 
                  ORDER BY d.id, ds.day_of_week, ds.start_time";
$doctors_result = $conn->query($doctors_query);

// Get all booked appointments
$booked_query = "SELECT doctor_id, appointment_time FROM appointments WHERE status = 'scheduled'";
$booked_result = $conn->query($booked_query);

// Store booked appointments in an array for easy lookup
$booked_slots = [];
while ($booked = $booked_result->fetch_assoc()) {
    $key = $booked['doctor_id'] . '_' . $booked['appointment_time'];
    $booked_slots[$key] = true;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Schedule Appointment - NTU Clinic</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/table.css">
</head>
<body>
    <?php include '../includes/nav.php'; ?>

    <div class="container">
        <h1>Schedule an Appointment</h1>
        <p>Welcome, <?php echo htmlspecialchars($_SESSION['full_name']); ?>! Select an available time slot to book your appointment.</p>

        <table>
            <thead>
                <tr>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Day</th>
                    <th>Time Slot</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php
                if ($doctors_result->num_rows > 0) {
                    // Get current date and next 30 days for scheduling
                    $start_date = new DateTime();
                    $end_date = new DateTime();
                    $end_date->modify('+30 days');
                    
                    while ($schedule = $doctors_result->fetch_assoc()) {
                        $doctor_id = $schedule['id'];
                        $doctor_name = htmlspecialchars($schedule['name']);
                        $specialty = htmlspecialchars($schedule['specialty']);
                        $day_of_week = $schedule['day_of_week'];
                        $start_time = $schedule['start_time'];
                        $end_time = $schedule['end_time'];
                        
                        // Generate time slots (hourly appointments)
                        $time_start = new DateTime($start_time);
                        $time_end = new DateTime($end_time);
                        
                        // Find next occurrence of this day of week
                        $current = clone $start_date;
                        while ($current <= $end_date) {
                            if ($current->format('l') === $day_of_week && $current >= $start_date) {
                                // Generate hourly slots for this day
                                $slot_time = clone $time_start;
                                while ($slot_time < $time_end) {
                                    $appointment_datetime = $current->format('Y-m-d') . ' ' . $slot_time->format('H:i:s');
                                    $slot_key = $doctor_id . '_' . $appointment_datetime;
                                    $display_time = $current->format('M d, Y') . ' at ' . $slot_time->format('g:i A');
                                    
                                    echo "<tr>";
                                    echo "<td>$doctor_name</td>";
                                    echo "<td>$specialty</td>";
                                    echo "<td>$day_of_week</td>";
                                    echo "<td>$display_time</td>";
                                    echo "<td>";
                                    
                                    // Check if slot is booked
                                    if (isset($booked_slots[$slot_key])) {
                                        echo "<span style='color: #999;'>Booked</span>";
                                    } else {
                                        // Display booking form
                                        echo "<form action='../includes/book.php' method='POST' style='margin: 0;'>";
                                        echo "<input type='hidden' name='doctor_id' value='$doctor_id'>";
                                        echo "<input type='hidden' name='appointment_time' value='$appointment_datetime'>";
                                        echo "<input type='submit' value='Book' style='width: auto; padding: 8px 16px;'>";
                                        echo "</form>";
                                    }
                                    
                                    echo "</td>";
                                    echo "</tr>";
                                    
                                    $slot_time->modify('+1 hour');
                                }
                            }
                            $current->modify('+1 day');
                        }
                    }
                } else {
                    echo "<tr><td colspan='5' style='text-align: center;'>No available schedules at this time.</td></tr>";
                }
                
                $conn->close();
                ?>
            </tbody>
        </table>
    </div>
</body>
</html>
