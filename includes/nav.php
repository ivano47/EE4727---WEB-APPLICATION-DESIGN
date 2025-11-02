<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$is_logged_in = isset($_SESSION['patient_id']);
?>
<nav>
    <a href="index.php" class="nav-logo">
        <img src="assets/qkntnoqkntnoqknt.webp" alt="NTU Clinic Logo">
    </a>
    
    <ul class="nav-links">
        <li><a href="index.php">Home</a></li>
        <li><a href="doctors.php">Our Doctors</a></li>
        <li><a href="schedule.php">Appointments</a></li>
        <li><a href="contact.php">Contact</a></li>
    </ul>
    
    <div class="nav-buttons">
        <?php if ($is_logged_in): ?>
            <a href="my_appointments.php" class="btn-primary">My Appointments</a>
            <a href="../includes/logout.php" class="btn-primary">Logout</a>
        <?php else: ?>
            <a href="schedule.php" class="btn-primary">Book Appointment</a>
            <a href="login.php" class="btn-secondary">Login</a>
        <?php endif; ?>
    </div>
</nav>
