<?php
session_start();
$is_logged_in = isset($_SESSION['patient_id']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home - NTU Clinic</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/home.css">
    <script src="scripts/smooth-scroll.js"></script>
</head>
<body>
    <?php include '../includes/nav.php'; ?>

    <section class="hero-section">
        <div class="hero-text">
            <h1>Your On-Campus Health Partner</h1>
            <p>Providing comprehensive medical and dental services to the NTU community.</p>
            <div class="hero-buttons">
                <?php if ($is_logged_in): ?>
                    <a href="schedule.php" class="hero-btn-primary">Book Appointment</a>
                <?php else: ?>
                    <a href="register.php" class="hero-btn-primary">Get Started</a>
                <?php endif; ?>
                <a href="doctors.php" class="hero-btn-outline">Meet Our Doctors</a>
            </div>
        </div>
        <div class="hero-image">
            <img src="assets/dsc_0531_rz_web.jpg" alt="NTU Clinic Interior">
        </div>
    </section>

    <div class="container">
        <section class="info-cards-container">
            <div class="info-card">
                <div class="info-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="40" height="40">
                        <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2l-1.5 1.5zM19 19c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11v14z"/>
                        <path d="M9 7h6v2H9zm0 4h6v2H9z"/>
                    </svg>
                </div>
                <h3>Licensed Doctors</h3>
                <p>Board-certified physicians with years of experience in family medicine and dental care.</p>
            </div>
            
            <div class="info-card">
                <div class="info-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="40" height="40">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                        <path d="M10.56 13.46l-2.12-2.12-1.41 1.41 3.53 3.54 5.66-5.66-1.41-1.42z"/>
                    </svg>
                </div>
                <h3>Easy Scheduling</h3>
                <p>Book appointments online 24/7 with our convenient scheduling system.</p>
            </div>
            
            <div class="info-card">
                <div class="info-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="40" height="40">
                        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.12 6 2.12v4.78z"/>
                        <path d="M9 12l2 2 4-4"/>
                    </svg>
                </div>
                <h3>Comprehensive Care</h3>
                <p>From preventive care to specialized treatments, we cover all your healthcare needs.</p>
            </div>
            
            <div class="info-card">
                <div class="info-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="40" height="40">
                        <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                    </svg>
                </div>
                <h3>Patient Testimonial</h3>
                <p>"The team here is incredibly caring and professional."</p>
            </div>
        </section>

        <section class="services-section">
            <h2>Our Services</h2>
            <div class="services-grid">
                <div class="service-item card">
                    <h3>Family Medicine</h3>
                    <p>Comprehensive primary care for patients of all ages, from routine check-ups to chronic disease management.</p>
                </div>
                
                <div class="service-item card">
                    <h3>Preventive Care</h3>
                    <p>Regular health screenings, vaccinations, and wellness programs to keep you healthy.</p>
                </div>
                
                <div class="service-item card">
                    <h3>General Dentistry</h3>
                    <p>Complete dental care including cleanings, fillings, and oral health maintenance.</p>
                </div>
                
                <div class="service-item card">
                    <h3>Cosmetic Dentistry</h3>
                    <p>Professional teeth whitening, veneers, and smile makeovers to boost your confidence.</p>
                </div>
                
                <div class="service-item card">
                    <h3>Dental Implants</h3>
                    <p>Advanced tooth replacement solutions for a natural-looking, permanent smile.</p>
                </div>
                
                <div class="service-item card">
                    <h3>Emergency Care</h3>
                    <p>Prompt treatment for urgent medical and dental issues when you need it most.</p>
                </div>
            </div>
        </section>

        <section class="card meet-doctors-card" style="padding: 60px 0;">
            <h2 style="font-size: 2.5em; margin-bottom: 20px; color: #2A3A6A;">Meet Our Doctors</h2>
            <p style="font-size: 1.2em; color: #666; margin-bottom: 30px;">Our team of experienced healthcare professionals is dedicated to providing you with the highest quality care.</p>
            
            <div class="doctors-grid">
                <div class="doctor-profile-card">
                    <div class="doctor-headshot">
                        <img src="assets/doctor-placeholder.jpg" alt="Dr. Emily Wong">
                    </div>
                    <h3>Dr. Emily Wong</h3>
                    <p class="doctor-specialty">General Dentist</p>
                </div>
                
                <div class="doctor-profile-card">
                    <div class="doctor-headshot">
                        <img src="assets/doctor-placeholder.jpg" alt="Dr. Michael Chen">
                    </div>
                    <h3>Dr. Michael Chen</h3>
                    <p class="doctor-specialty">Family Medicine</p>
                </div>
                
                <div class="doctor-profile-card">
                    <div class="doctor-headshot">
                        <img src="assets/doctor-placeholder.jpg" alt="Dr. Sarah Lim">
                    </div>
                    <h3>Dr. Sarah Lim</h3>
                    <p class="doctor-specialty">Pediatric Dentist</p>
                </div>
            </div>
            
            <a href="doctors.php" class="btn-secondary" style="margin-top: 30px;">View Our Team</a>
        </section>
    </div>

    <section id="contact" class="contact-footer-section">
        <div class="contact-footer-container">
            <div class="contact-left-column">
                <div class="contact-info-block">
                    <h4>📍 Visit Our Clinic</h4>
                    <p>50 Nanyang Avenue<br>Singapore 639798</p>
                </div>
                
                <div class="contact-info-block">
                    <h4>📞 Contact Information</h4>
                    <p><strong>Phone:</strong> +65 6791 1234</p>
                    <p><strong>Email:</strong> info@ntuclinic.com</p>
                    <p><strong>Emergency:</strong> Call 995</p>
                </div>
                
                <div class="contact-info-block">
                    <h4>🕐 Operating Hours</h4>
                    <p><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM</p>
                    <p><strong>Saturday:</strong> 9:00 AM - 2:00 PM</p>
                    <p><strong>Sunday:</strong> Closed</p>
                </div>
            </div>
            
            <div class="contact-right-column">
                <h4>✉️ Send Us a Message</h4>
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
                    
                    <button type="submit" class="btn-contact-submit">Send Message</button>
                </form>
            </div>
        </div>
    </section>

    <footer>
        <p>&copy; 2025 NTU Clinic. All rights reserved.</p>
    </footer>
</body>
</html>

