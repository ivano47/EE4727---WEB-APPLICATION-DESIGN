<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Determine user role
$user_role = $_SESSION['role'] ?? null;
?>
<nav>
    <a href="index.php" class="nav-logo">
        <img src="assets/qkntnoqkntnoqknt.webp" alt="NTU Clinic Logo">
    </a>
    
    <button id="mobile-menu-toggle" class="mobile-menu-toggle">☰</button>
    
    <div id="mobile-menu-links" class="nav-hidden">
        <ul class="nav-links">
            <li><a href="index.php">Home</a></li>
            <li><a href="doctors.php">Our Doctors</a></li>
            <?php if ($user_role !== 'doctor'): ?>
                <li><a href="schedule.php">Appointments</a></li>
            <?php endif; ?>
            <li><a href="contact.php">Contact</a></li>
        </ul>
        
        <div class="nav-buttons">
            <?php if ($user_role === 'doctor'): ?>
                <a href="doctor_dashboard.php" class="btn btn-primary">Dashboard</a>
                <a href="../includes/logout.php" class="btn btn-secondary">Logout</a>
            <?php elseif ($user_role === 'patient'): ?>
                <a href="my_appointments.php" class="btn btn-primary">My Appointments</a>
                <a href="../includes/logout.php" class="btn btn-secondary">Logout</a>
            <?php else: ?>
                <a href="schedule.php" class="btn btn-primary">Book Appointment</a>
                <a href="login.php" class="btn btn-secondary">Login</a>
            <?php endif; ?>
        </div>
    </div>
</nav>
<script src="scripts/mobile-menu.js"></script>
