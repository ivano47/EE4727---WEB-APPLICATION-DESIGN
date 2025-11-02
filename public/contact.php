<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us - NTU Clinic</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/contact.css">
</head>
<body>
    <?php include '../includes/nav.php'; ?>

    <div class="container">
        <div class="contact-page-container">
            <h1>Contact Us</h1>

            <?php if (isset($_GET['success']) && $_GET['success'] === 'message_sent'): ?>
                <div class="alert alert-success">
                    ✓ Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
            <?php endif; ?>

            <?php if (isset($_GET['error'])): ?>
                <div class="alert alert-error">
                    <?php
                    $error = $_GET['error'];
                    if ($error === 'empty_fields') {
                        echo '✗ Please fill in all required fields.';
                    } elseif ($error === 'invalid_email') {
                        echo '✗ Please enter a valid email address.';
                    } else {
                        echo '✗ An error occurred. Please try again.';
                    }
                    ?>
                </div>
            <?php endif; ?>

            <div class="contact-columns">

                <div class="contact-info-column">
                    <div class="contact-info-block">
                        <h3><span class="icon-green">●</span> Visit Our Clinic</h3>
                        <p>50 Nanyang Avenue<br>Singapore 639798</p>
                    </div>

                    <div class="contact-info-block">
                        <h3><span class="icon-green">●</span> Contact Information</h3>
                        <p><strong>Phone:</strong> +65 6791 1234</p>
                        <p><strong>Email:</strong> info@ntuclinic.com</p>
                        <p><strong>Emergency:</strong> Call 995</p>
                    </div>

                    <div class="contact-info-block">
                        <h3><span class="icon-green">●</span> Operating Hours</h3>
                        <p><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM</p>
                        <p><strong>Saturday:</strong> 9:00 AM - 2:00 PM</p>
                        <p><strong>Sunday:</strong> Closed</p>
                    </div>
                </div>

                <div class="contact-form-column">
                    <h2>Send Us a Message</h2>
                    <form action="../includes/contact_form.php" method="POST">
                        <input type="hidden" name="redirect_page" value="contact">
                        
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
        </div>
    </div>

    <footer>
        <p>&copy; 2025 NTU Clinic. All rights reserved.</p>
    </footer>
</body>
</html>
