<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patient Login - NTU Clinic</title>
    <link rel="stylesheet" href="styles/main.css">
    <script src="scripts/validation.js"></script>
</head>
<body>
    <?php include '../includes/nav.php'; ?>

    <div class="container">
        <h1>Patient Login</h1>
        <p>Login to your account to manage appointments.</p>

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
</body>
</html>

