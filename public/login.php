<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patient Login - NTU Clinic</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <?php include '../includes/nav.php'; ?>

    <div class="container">
        <h1>Patient Login</h1>
        <p>Login to your account to manage appointments.</p>

        <form action="../includes/login.php" method="POST">
            <label for="email">Email Address:</label>
            <input type="email" id="email" name="email" required>

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>

            <input type="submit" value="Login">
        </form>

        <p style="text-align: center; margin-top: 20px;">
            Don't have an account? <a href="register.php">Register here</a>
        </p>
    </div>
</body>
</html>
