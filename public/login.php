<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patient Login - NTU Clinic</title>
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
            <h1>Patient Login</h1>
            <p>Login to your account to manage appointments.</p>

            <?php
            // display success message  registering
            if (isset($_GET['success']) && $_GET['success'] === 'registered') {
                echo '<div class="alert alert-success">Registration successful! Please login with your credentials.</div>';
            }
            
            // error messages
            if (isset($_GET['error'])) {
                $error = $_GET['error'];
                if ($error === 'empty_fields') {
                    echo '<div class="alert alert-error">Please fill in all fields.</div>';
                } elseif ($error === 'invalid_credentials') {
                    echo '<div class="alert alert-error">Invalid email or password. Please try again.</div>';
                }
            }
            ?>

            <form action="../includes/login.php" method="POST" onsubmit="return validateLoginForm()">
                <label for="email">Email Address:</label>
                <input type="email" id="email" name="email" required>

                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>

                <input type="submit" value="Login">
            </form>

            <p class="text-center mt-20">
                Don't have an account? <a href="register.php">Register here</a>
            </p>
        </div>
    </div>

    <footer>
        <p>&copy; 2025 NTU Clinic. All rights reserved.</p>
    </footer>
</body>
</html>

