// Client-side form validation

// Registration form validation
function validateRegistrationForm() {
    const fullName = document.getElementById('full_name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    
    // Check if full name is empty
    if (fullName === '') {
        alert('Please enter your full name.');
        return false;
    }
    
    // Check if full name has at least 2 characters??
    if (fullName.length < 2) {
        alert('Full name must be at least 2 characters long.');
        return false;
    }
    // Check if full name contains numbers
    const namePattern = /\d/;
    if (namePattern.test(fullName)) {
        alert('Full name cannot contain numbers.');
        return false;
    }
    // Check if email is empty
    if (email === '') {
        alert('Please enter your email address.');
        return false;
    }
    // Validate email format (allow @localhost for development)
    const emailPattern = /^[^\s@]+@[^\s@]+(\.[^\s@]+)?$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }
    // Check if password is empty
    if (password === '') {
        alert('Please enter a password.');
        return false;
    }
    // Check password length
    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return false;
    }
    // Check if confirm password is empty
    if (confirmPassword === '') {
        alert('Please confirm your password.');
        return false;
    }
    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return false;
    }
    return true;
}

// Login form validation
function validateLoginForm() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Check if email is empty
    if (email === '') {
        alert('Please enter your email address.');
        return false;
    }
    // Validate email format (allow @localhost for development)
    const emailPattern = /^[^\s@]+@[^\s@]+(\.[^\s@]+)?$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }
    // Check if password is empty
    if (password === '') {
        alert('Please enter your password.');
        return false;
    }
    return true;
}

// Display error messages from URL parameters
function displayErrorMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const success = urlParams.get('success');
    
    if (error) {
        let message = '';
        switch(error) {
            case 'empty_fields':
                message = 'Please fill in all required fields.';
                break;
            case 'password_mismatch':
                message = 'Passwords do not match.';
                break;
            case 'invalid_email':
                message = 'Please enter a valid email address.';
                break;
            case 'email_exists':
                message = 'This email is already registered. Please login or use a different email.';
                break;
            case 'registration_failed':
                message = 'Registration failed. Please try again.';
                break;
            case 'invalid_credentials':
                message = 'Invalid email or password.';
                break;
            default:
                message = 'An error occurred. Please try again.';
        }
        
        showMessage(message, 'error');
    }
    
    if (success) {
        let message = '';
        switch(success) {
            case 'registered':
                message = 'Registration successful! Please login with your credentials.';
                break;
            default:
                message = 'Operation successful!';
        }
        
        showMessage(message, 'success');
    }
}

// Show message helper function
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.style.padding = '10px';
    messageDiv.style.marginBottom = '15px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.textAlign = 'center';
    
    if (type === 'error') {
        messageDiv.style.backgroundColor = '#ffebee';
        messageDiv.style.color = '#c62828';
        messageDiv.innerHTML = '✗ ' + message;
    } else if (type === 'success') {
        messageDiv.style.backgroundColor = '#e8f5e9';
        messageDiv.style.color = '#2e7d32';
        messageDiv.innerHTML = '✓ ' + message;
    }
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    displayErrorMessage();
});
