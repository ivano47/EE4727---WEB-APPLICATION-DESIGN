import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-primary text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Visit Us */}
          <div>
            <h3 className="font-heading text-lg font-bold text-white mb-4">Visit Our Clinic</h3>
            <p>123 Clinic Street</p>
            <p>Singapore, 123456</p>
          </div>

          {/* Column 2: Contact Info */}
          <div>
            <h3 className="font-heading text-lg font-bold text-white mb-4">Contact Information</h3>
            <p>Phone: +65 1234 5678</p>
            <p>Email: info@ntuclinic.com</p>
          </div>

          {/* Column 3: Operating Hours */}
          <div>
            <h3 className="font-heading text-lg font-bold text-white mb-4">Operating Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p>Saturday: 9:00 AM - 1:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500">
          <p>© 2025 NTU Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;