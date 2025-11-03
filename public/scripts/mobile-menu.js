//hamburger toggle to hide nav (takes up half the screen)
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu-links');
    
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('nav-hidden');
            mobileMenu.classList.toggle('nav-visible');
        });
    }
});
