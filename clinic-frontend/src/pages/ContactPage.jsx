import React from 'react';

const ContactPage = () => {
  console.log('ContactPage rendered');
  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold text-primary text-center">This is the Contact Page</h1>
      <div className="contact-page-container">
        <h1>Contact Us</h1>

        <div className="contact-columns">
          <div className="contact-info-column">
            <div className="contact-info-block">
              <h3><span className="icon-green">●</span> Visit Our Clinic</h3>
              <p>50 Nanyang Avenue<br />Singapore 639798</p>
            </div>

            <div className="contact-info-block">
              <h3><span className="icon-green">●</span> Contact Information</h3>
              <p><strong>Phone:</strong> +65 6791 1234</p>
              <p><strong>Email:</strong> info@ntuclinic.com</p>
              <p><strong>Emergency:</strong> Call 995</p>
            </div>

            <div className="contact-info-block">
              <h3><span className="icon-green">●</span> Operating Hours</h3>
              <p><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM</p>
              <p><strong>Saturday:</strong> 9:00 AM - 2:00 PM</p>
              <p><strong>Sunday:</strong> Closed</p>
            </div>
          </div>

          <div className="contact-form-column">
            <h2>Send Us a Message</h2>
            <p>Our contact form is currently under maintenance. Please contact us via phone or email.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;