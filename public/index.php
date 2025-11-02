<?php
session_start();
$is_logged_in = isset($_SESSION['patient_id']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NTU Clinic - Home</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/home.css">
    <script src="scripts/smooth-scroll.js"></script>
</head>
<body>
    <?php include '../includes/nav.php'; ?>

    <section class="hero-section">
        <div class="hero-text">
            <h1>Your Health is Our Priority</h1>
            <p>Experience exceptional healthcare with our team of dedicated professionals. From family medicine to dental care, we provide comprehensive services tailored to your needs.</p>
            <div class="hero-buttons">
                <?php if ($is_logged_in): ?>
                    <a href="schedule.php" class="hero-btn-primary">Book Appointment</a>
                <?php else: ?>
                    <a href="register.php" class="hero-btn-primary">Get Started</a>
                <?php endif; ?>
                <a href="doctors.php" class="hero-btn-secondary">Meet Our Doctors</a>
            </div>
        </div>
        <div class="hero-image">
            <img src="https://via.placeholder.com/600x400/4A90E2/ffffff?text=Modern+Clinic+Interior" alt="NTU Clinic Interior">
        </div>
    </section>

    <div class="container">
        <section class="info-cards-container">
            <div class="info-card">
                <div class="info-card-icon">👨‍⚕️</div>
                <h3>Licensed Doctors</h3>
                <p>Board-certified physicians with years of experience in family medicine and dental care.</p>
            </div>
            
            <div class="info-card">
                <div class="info-card-icon">📅</div>
                <h3>Easy Scheduling</h3>
                <p>Book appointments online 24/7 with our convenient scheduling system.</p>
            </div>
            
            <div class="info-card">
                <div class="info-card-icon">💊</div>
                <h3>Comprehensive Care</h3>
                <p>From preventive care to specialized treatments, we cover all your healthcare needs.</p>
            </div>
            
            <div class="info-card">
                <div class="info-card-icon">⭐</div>
                <h3>Patient Focused</h3>
                <p>Your comfort and well-being are at the heart of everything we do.</p>
            </div>
        </section>

        <section class="services-section">
            <h2>Our Services</h2>
            <div class="services-grid">
                <div class="service-item">
                    <h3>Family Medicine</h3>
                    <p>Comprehensive primary care for patients of all ages, from routine check-ups to chronic disease management.</p>
                </div>
                
                <div class="service-item">
                    <h3>Preventive Care</h3>
                    <p>Regular health screenings, vaccinations, and wellness programs to keep you healthy.</p>
                </div>
                
                <div class="service-item">
                    <h3>General Dentistry</h3>
                    <p>Complete dental care including cleanings, fillings, and oral health maintenance.</p>
                </div>
                
                <div class="service-item">
                    <h3>Cosmetic Dentistry</h3>
                    <p>Professional teeth whitening, veneers, and smile makeovers to boost your confidence.</p>
                </div>
                
                <div class="service-item">
                    <h3>Dental Implants</h3>
                    <p>Advanced tooth replacement solutions for a natural-looking, permanent smile.</p>
                </div>
                
                <div class="service-item">
                    <h3>Emergency Care</h3>
                    <p>Prompt treatment for urgent medical and dental issues when you need it most.</p>
                </div>
            </div>
        </section>

        <section style="text-align: center; padding: 60px 0;">
            <h2 style="font-size: 2.5em; margin-bottom: 20px; color: #333;">Meet Our Doctors</h2>
            <p style="font-size: 1.2em; color: #666; margin-bottom: 30px;">Our team of experienced healthcare professionals is dedicated to providing you with the highest quality care.</p>
            <a href="doctors.php" class="hero-btn-primary">View Our Team</a>
        </section>
    </div>

    <section id="contact" class="contact-section">
        <div class="container" style="display: flex; flex-wrap: wrap; gap: 40px; width: 100%;">
            <!-- Contact Information -->
            <div class="contact-info">
                <h2>Get In Touch</h2>
                <p>We are here to answer your questions and schedule your appointments.</p>
                
                <div class="contact-details">
                    <h3>📍 Visit Our Clinic</h3>
                    <p>50 Nanyang Avenue<br>
                    Singapore 639798</p>
                </div>
                
                <div class="contact-details">
                    <h3>📞 Contact Information</h3>
                    <p><strong>Phone:</strong> +65 6791 1234<br>
                    <strong>Email:</strong> info@ntuclinic.com</p>
                </div>
                
                <div class="contact-details">
                    <h3>🕐 Operating Hours</h3>
                    <p>
                        <strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM<br>
                        <strong>Saturday:</strong> 9:00 AM - 2:00 PM<br>
                        <strong>Sunday:</strong> Closed
                    </p>
                </div>
                
                <div class="contact-details">
                    <h3>🚨 Emergency Services</h3>
                    <p>For medical emergencies, please call <strong>995</strong> or visit the nearest hospital emergency department.</p>
                </div>
            </div>
            
            <!-- Contact Form -->
            <div class="contact-form">
                <h3>Send Us a Message</h3>
                <form action="../includes/contact_form.php" method="POST">
                    <label for="first_name">First Name:</label>
                    <input type="text" id="first_name" name="first_name" required>
                    
                    <label for="last_name">Last Name:</label>
                    <input type="text" id="last_name" name="last_name" required>
                    
                    <label for="email">Email Address:</label>
                    <input type="email" id="email" name="email" required>
                    
                    <label for="subject">Subject:</label>
                    <input type="text" id="subject" name="subject" required>
                    
                    <label for="message">Message:</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                    
                    <button type="submit">Send Message</button>
                </form>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer style="background-color: #333; color: white; text-align: center; padding: 20px 0; margin-top: 0;">
        <p>&copy; 2025 NTU Family & Dental Clinic. All rights reserved.</p>
    </footer>
</body>
</html>

