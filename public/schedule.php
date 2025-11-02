<?php
// Start session
session_start();

require_once '../includes/db_connect.php';

// USER SHOULD BE LOGGED IN ALREADY
if (!isset($_SESSION['patient_id'])) {
    header("Location: login.php");
    exit();
}

// GET selected doctor and date from URL
$selected_doctor = $_GET['doctor_id'] ?? null;
$selected_date = $_GET['date'] ?? date('Y-m-d');

// Get ALL doctors for dropdown
$doctors_query = "SELECT id, name, specialty FROM doctors ORDER BY name";
$doctors_result = $conn->query($doctors_query);

// Get booked appointments if doctor and date are selected to hide
$booked_slots = [];
if ($selected_doctor && $selected_date) {
    $booked_query = "SELECT appointment_time FROM appointments 
                     WHERE doctor_id = ? AND DATE(appointment_time) = ? AND status = 'scheduled'";
    $booked_stmt = $conn->prepare($booked_query);
    $booked_stmt->bind_param("is", $selected_doctor, $selected_date);
    $booked_stmt->execute();
    $booked_result = $booked_stmt->get_result();
    
    while ($booked = $booked_result->fetch_assoc()) {
        $booked_slots[] = $booked['appointment_time'];
    }
    $booked_stmt->close();
}

// Get doctor's schedule if doctor is selected
$doctor_schedule = [];
$doctor_name = '';
$doctor_specialty = '';
if ($selected_doctor) {
    $schedule_query = "SELECT ds.day_of_week, ds.start_time, ds.end_time, d.name, d.specialty
                       FROM doctor_schedules ds
                       INNER JOIN doctors d ON ds.doctor_id = d.id
                       WHERE ds.doctor_id = ?";
    $schedule_stmt = $conn->prepare($schedule_query);
    $schedule_stmt->bind_param("i", $selected_doctor);
    $schedule_stmt->execute();
    $schedule_result = $schedule_stmt->get_result();
    
    while ($schedule = $schedule_result->fetch_assoc()) {
        $doctor_schedule[$schedule['day_of_week']] = [
            'start_time' => $schedule['start_time'],
            'end_time' => $schedule['end_time']
        ];
        $doctor_name = $schedule['name'];
        $doctor_specialty = $schedule['specialty'];
    }
    $schedule_stmt->close();
}

// Calendar calculations 😭
$current_month = date('Y-m', strtotime($selected_date));
$first_day_of_month = date('Y-m-01', strtotime($selected_date));
$last_day_of_month = date('Y-m-t', strtotime($selected_date));
$days_in_month = date('t', strtotime($selected_date));
$first_day_weekday = date('w', strtotime($first_day_of_month)); // 0 (Sunday) to 6 (Saturday)

// Previous and next month
$prev_month = date('Y-m-d', strtotime($first_day_of_month . ' -1 month'));
$next_month = date('Y-m-d', strtotime($first_day_of_month . ' +1 month'));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Schedule Appointment - NTU Clinic</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/schedule.css">
    <script src="scripts/schedule.js"></script>
</head>
<body>
    <?php include '../includes/nav.php'; ?>

    <div class="container">
        <h1>Schedule an Appointment</h1>
        <p>Welcome, <?php echo htmlspecialchars($_SESSION['full_name']); ?>! Select a doctor and date to view available time slots.</p>

        <div class="schedule-container">
            <!-- Doctor Selection and Calendar -->
            <form action="schedule.php" method="GET" class="schedule-controls">
                <!-- Doctor Selection -->
                <div class="doctor-select-container">
                    <label for="doctor">Select Doctor:</label>
                    <select name="doctor_id" id="doctor" onchange="this.form.submit()" required>
                        <option value="">-- Choose a Doctor --</option>
                        <?php
                        if ($doctors_result->num_rows > 0) {
                            while ($doctor = $doctors_result->fetch_assoc()) {
                                $selected = ($selected_doctor == $doctor['id']) ? 'selected' : '';
                                echo "<option value='" . $doctor['id'] . "' $selected>";
                                echo htmlspecialchars($doctor['name']) . " - " . htmlspecialchars($doctor['specialty']);
                                echo "</option>";
                            }
                        }
                        ?>
                    </select>
                </div>

                <?php if ($selected_doctor): ?>
                    <!-- Calendar Display -->
                    <div class="calendar-section">
                        <div class="calendar-header">
                            <a href="schedule.php?doctor_id=<?php echo $selected_doctor; ?>&date=<?php echo $prev_month; ?>" class="btn-link">← Previous</a>
                            <h3><?php echo date('F Y', strtotime($selected_date)); ?></h3>
                            <a href="schedule.php?doctor_id=<?php echo $selected_doctor; ?>&date=<?php echo $next_month; ?>" class="btn-link">Next →</a>
                        </div>

                        <div class="calendar-grid">
                            <!-- Day names (no idea how to make this dynamic) -->
                            <div class="day-name">Sun</div>
                            <div class="day-name">Mon</div>
                            <div class="day-name">Tue</div>
                            <div class="day-name">Wed</div>
                            <div class="day-name">Thu</div>
                            <div class="day-name">Fri</div>
                            <div class="day-name">Sat</div>

                            <?php
                            // Empty cells before first day
                            for ($i = 0; $i < $first_day_weekday; $i++) {
                                echo '<div class="day empty"></div>';
                            }

                            // Days of the month
                            $today = date('Y-m-d');
                            for ($day = 1; $day <= $days_in_month; $day++) {
                                $current_date = $current_month . '-' . sprintf('%02d', $day);
                                $day_of_week = date('l', strtotime($current_date));
                                
                                // Check if doctor works on this day and if its not in the past
                                $is_available = isset($doctor_schedule[$day_of_week]) && $current_date >= $today;
                                $is_selected = ($current_date === $selected_date);
                                
                                if ($is_available) {
                                    $selected_class = $is_selected ? 'selected' : '';
                                    echo '<div class="day">';
                                    echo '<a href="schedule.php?doctor_id=' . $selected_doctor . '&date=' . $current_date . '" class="day-link ' . $selected_class . '">' . $day . '</a>';
                                    echo '</div>';
                                } else {
                                    echo '<div class="day disabled">' . $day . '</div>';
                                }
                            }
                            ?>
                        </div>
                    </div>
                <?php endif; ?>
            </form>

            <!-- Time Slots -->
            <?php if ($selected_doctor && $selected_date): ?>
                <div class="timeslot-container">
                    <?php
                    $day_of_week = date('l', strtotime($selected_date));
                    
                    if (isset($doctor_schedule[$day_of_week])) {
                        echo "<h3>Available Time Slots for Dr. " . htmlspecialchars($doctor_name) . " on " . date('F j, Y', strtotime($selected_date)) . "</h3>";
                        
                        $start_time = new DateTime($doctor_schedule[$day_of_week]['start_time']);
                        $end_time = new DateTime($doctor_schedule[$day_of_week]['end_time']);
                        
                        echo '<div class="timeslot-grid">';
                        
                        $has_slots = false;
                        
                        // Generate hourly time slots
                        $current_time = clone $start_time;
                        while ($current_time < $end_time) {
                            $has_slots = true;
                            $time_str = $current_time->format('H:i:s');
                            $appointment_datetime = $selected_date . ' ' . $time_str;
                            $display_time = $current_time->format('g:i A');
                            
                            // Check if this slot is booked
                            $is_booked = in_array($appointment_datetime, $booked_slots);
                            
                            if ($is_booked) {
                                echo '<div class="time-button booked">
                                        ' . $display_time . '<br>
                                        <small>Booked</small>
                                      </div>';
                            } else {
                                echo '<button type="button" class="time-button" onclick="selectTimeSlot(this, \'' . $appointment_datetime . '\', ' . $selected_doctor . ', \'' . $display_time . '\')">' 
                                     . $display_time . 
                                     '</button>';
                            }
                            
                            $current_time->modify('+1 hour');
                        }
                        
                        echo '</div>';
                        
                        if (!$has_slots) {
                            echo '<div class="no-slots">No time slots available for this date.</div>';
                        }
                    } else {
                        echo '<div class="no-slots">Dr. ' . htmlspecialchars($doctor_name) . ' is not available on ' . date('l, F j, Y', strtotime($selected_date)) . '</div>';
                    }
                    ?>
                </div>
            <?php elseif ($selected_doctor): ?>
                <div class="no-slots">Please select a date from the calendar above to view available time slots.</div>
            <?php endif; ?>
        </div>
    </div>

    <footer>
        <p>&copy; 2025 NTU Clinic. All rights reserved.</p>
    </footer>
</body>
</html>
<?php
$conn->close();
?>
