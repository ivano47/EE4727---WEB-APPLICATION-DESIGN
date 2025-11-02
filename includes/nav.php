<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$is_logged_in = isset($_SESSION['patient_id']);
?>
<nav>
    <ul>
        <li><a href="index.php">Home</a></li>
        <li><a href="doctors.php">Our Doctors</a></li>
        <li><a href="schedule.php">Appointments</a></li>
        <li><a href="index.php#contact">Contact</a></li>
        <?php if ($is_logged_in): ?>
            <li><a href="my_appointments.php">My Appointments</a></li>
            <li><a href="../includes/logout.php">Logout</a></li>
        <?php else: ?>
            <li><a href="login.php">Login</a></li>
        <?php endif; ?>
    </ul>
</nav>
