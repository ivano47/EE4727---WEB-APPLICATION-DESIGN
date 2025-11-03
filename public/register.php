<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patient Registration - NTU Clinic</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/login_regis.css">
    <script src="scripts/validation.js"></script>
</head>
<body>
    <?php include '../includes/nav.php'; ?>

    <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-logo">
                <img src="assets/qkntnoqkntnoqknt.webp" alt="NTU Clinic Logo">
            </div>
            <h1>Patient Registration</h1>
            <p>Create an account to book appointments with our doctors.</p>

            <form action="../includes/register.php" method="POST" onsubmit="return validateRegistrationForm()">
                <label for="full_name">Full Name:</label>
                <input type="text" id="full_name" name="full_name" required>

                <label for="email">Email Address:</label>
                <input type="email" id="email" name="email" required>

                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>

                <label for="confirm_password">Confirm Password:</label>
                <input type="password" id="confirm_password" name="confirm_password" required>

                <input type="submit" value="Register">
            </form>

            <p class="text-center mt-20">
                Already have an account? <a href="login.php">Login here</a>
            </p>
        </div>
    </div>

    <footer>
        <p>&copy; 2025 NTU Clinic. All rights reserved.</p>
    </footer>
</body>
</html>

