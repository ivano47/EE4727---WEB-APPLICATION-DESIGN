<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Our Doctors - NTU Clinic</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <?php 
    session_start();
    include '../includes/nav.php'; 
    ?>

    <div class="container">
        <h1>Our Doctors</h1>
        <p>Meet our team of experienced healthcare professionals dedicated to providing you with exceptional care.</p>

        <div class="doctor-card">
            <img src="https://via.placeholder.com/200x200/4A90E2/ffffff?text=Dr.+Johnson" alt="Dr. Sarah Tan" class="doctor-image">
            <div class="doctor-info">
                <h2>Dr. Sarah Tan</h2>
                <h3>Family Doctor</h3>
                <p>Dr. Sarah Johnson is a board-certified family physician with 15 years of experience in comprehensive primary care. She graduated from NTU and completed her residency at NUH. Dr. Johnson specializes in preventive medicine, women's health, and pediatric care. She believes in building long-term relationships with her patients and providing personalized healthcare solutions.</p>
                <p><strong>Available:</strong> Monday - Friday</p>
                <?php if (isset($_SESSION['patient_id'])): ?>
                    <a href="schedule.php?doctor_id=1" class="btn-primary mt-10">Book with Dr. Tan</a>
                <?php else: ?>
                    <a href="login.php" class="btn-primary mt-10">Login to Book with Dr. Tan</a>
                <?php endif; ?>
            </div>
        </div>

        <div class="doctor-card">
            <img src="https://via.placeholder.com/200x200/4A90E2/ffffff?text=Dr.+Chen" alt="Dr. Michael Chen" class="doctor-image">
            <div class="doctor-info">
                <h2>Dr. Michael Chen</h2>
                <h3>Family Doctor</h3>
                <p>Dr. Michael Chen brings over 12 years of experience in family medicine with a special focus on chronic disease management and preventive care for all ages. He earned his medical degree from NUS of Medicine and completed his residency at SGH. Dr. Chen is passionate about helping patients achieve optimal health through lifestyle modifications and evidence-based medical treatments.</p>
                <p><strong>Available:</strong> Monday, Wednesday - Saturday</p>
                <?php if (isset($_SESSION['patient_id'])): ?>
                    <a href="schedule.php?doctor_id=2" class="btn-primary mt-10">Book with Dr. Chen</a>
                <?php else: ?>
                    <a href="login.php" class="btn-primary mt-10">Login to Book with Dr. Chen</a>
                <?php endif; ?>
            </div>
        </div>

        <div class="doctor-card">
            <img src="https://via.placeholder.com/200x200/4A90E2/ffffff?text=Dr.+Williams" alt="Dr. Emily Wong" class="doctor-image">
            <div class="doctor-info">
                <h2>Dr. Emily Wong</h2>
                <h3>Dentist</h3>
                <p>Dr. Emily Wong is a general dentist specializing in cosmetic dentistry and preventive oral care. With 10 years of experience, she has helped thousands of patients achieve healthy, beautiful smiles. Dr. Williams graduated from NUS Dentistry. She is known for her gentle approach and commitment to patient comfort.</p>
                <p><strong>Available:</strong> Monday, Tuesday, Thursday - Saturday</p>
                <?php if (isset($_SESSION['patient_id'])): ?>
                    <a href="schedule.php?doctor_id=3" class="btn-primary mt-10">Book with Dr. Wong</a>
                <?php else: ?>
                    <a href="login.php" class="btn-primary mt-10">Login to Book with Dr. Wong</a>
                <?php endif; ?>
            </div>
        </div>

        <div class="doctor-card">
            <img src="https://via.placeholder.com/200x200/4A90E2/ffffff?text=Dr.+Martinez" alt="Dr. Robert Lim" class="doctor-image">
            <div class="doctor-info">
                <h2>Dr. Robert Lim</h2>
                <h3>Dentist</h3>
                <p>Dr. Robert Lim is an experienced dentist with expertise in advanced dental procedures including dental implants and orthodontics. He has been practicing for 18 years and earned his Doctor of Dental Surgery degree from the University of Pennsylvania School of Dental Medicine. Dr. Lim stays current with the latest dental technologies and techniques to provide his patients with the best possible care.</p>
                <p><strong>Available:</strong> Tuesday - Saturday</p>
                <?php if (isset($_SESSION['patient_id'])): ?>
                    <a href="schedule.php?doctor_id=4" class="btn-primary mt-10">Book with Dr. Lim</a>
                <?php else: ?>
                    <a href="login.php" class="btn-primary mt-10">Login to Book with Dr. Lim</a>
                <?php endif; ?>
            </div>
        </div>

        <div class="mt-30 text-center">
            <p><strong>Not sure which doctor to see?</strong></p>
            <?php if (isset($_SESSION['patient_id'])): ?>
                <a href="schedule.php" class="btn btn-dark mt-10">View All Available Appointments</a>
            <?php else: ?>
                <a href="login.php" class="btn btn-dark mt-10">Login to Schedule</a>
            <?php endif; ?>
        </div>
    </div>

    <footer>
        <p>&copy; 2025 NTU Clinic. All rights reserved.</p>
    </footer>
</body>
</html>

