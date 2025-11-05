/**
 * Email Service for sending appointment confirmation emails
 * Uses Supabase Edge Function to call Resend API (server-side, no CORS issues)
 */

import { supabase } from '../supabaseClient';

// Edge Function URL - will be set after deployment
const EDGE_FUNCTION_URL = import.meta.env.VITE_EDGE_FUNCTION_URL ||
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-appointment-email`;

/**
 * Send appointment confirmation email to patient
 * @param {Object} emailData - Email data
 * @param {string} emailData.patientEmail - Patient's email address
 * @param {string} emailData.patientName - Patient's full name
 * @param {string} emailData.doctorName - Doctor's full name
 * @param {string} emailData.appointmentTime - Appointment datetime (ISO string)
 * @param {string} emailData.specialty - Doctor's specialty
 * @returns {Promise<Object>} - Response from email service
 */
export const sendAppointmentConfirmation = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentTime,
  specialty
}) => {
  try {
    console.log('Sending email via Edge Function to:', patientEmail);
    console.log('Edge Function URL:', EDGE_FUNCTION_URL);

    // Get the current session for auth
    const { data: { session } } = await supabase.auth.getSession();

    // Call the Edge Function
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        patientEmail,
        patientName,
        doctorName,
        appointmentTime,
        specialty,
        type: 'confirmation'
      })
    });

    console.log('Edge Function response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Edge Function error:', error);
      throw new Error(error.error || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Email sent successfully via Edge Function:', result);
    return { success: true, data: result };

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/*
 * ============================================================================
 * OLD IMPLEMENTATIONS BELOW - For Reference Only
 * ============================================================================
 *
 * These functions attempted to call Resend API directly from the browser,
 * but failed due to CORS restrictions. We now use Supabase Edge Functions
 * (server-side) to send emails, which avoids CORS issues.
 *
 * Keeping this code for reference in case needed for debugging or understanding
 * the implementation history.
 * ============================================================================
 */

const sendEmailDirectlyOLD = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentTime,
  specialty
}) => {
  try {
    // Format the appointment date and time
    const appointmentDate = new Date(appointmentTime);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .appointment-details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .detail-row {
              padding: 10px 0;
              border-bottom: 1px solid #e9ecef;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #667eea;
              display: inline-block;
              width: 120px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #dee2e6;
              color: #6c757d;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">Appointment Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${patientName},</p>
            <p>Your appointment has been successfully scheduled. We look forward to seeing you!</p>

            <div class="appointment-details">
              <h2 style="margin-top: 0; color: #667eea;">Appointment Details</h2>
              <div class="detail-row">
                <span class="label">Doctor:</span>
                <span>${doctorName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Specialty:</span>
                <span>${specialty}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span>${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span>${formattedTime}</span>
              </div>
            </div>

            <p><strong>Important Information:</strong></p>
            <ul>
              <li>Please arrive 15 minutes before your scheduled appointment time</li>
              <li>Bring your identification and insurance card</li>
              <li>If you need to reschedule or cancel, please contact us at least 24 hours in advance</li>
            </ul>

            <p>If you have any questions, please don't hesitate to contact us.</p>

            <p>Best regards,<br>Healthcare Clinic Team</p>
          </div>
          <div class="footer">
            <p>This is an automated confirmation email. Please do not reply to this message.</p>
          </div>
        </body>
      </html>
    `;

    // Text version for email clients that don't support HTML
    const textContent = `
Appointment Confirmed!

Dear ${patientName},

Your appointment has been successfully scheduled. We look forward to seeing you!

Appointment Details:
- Doctor: ${doctorName}
- Specialty: ${specialty}
- Date: ${formattedDate}
- Time: ${formattedTime}

Important Information:
- Please arrive 15 minutes before your scheduled appointment time
- Bring your identification and insurance card
- If you need to reschedule or cancel, please contact us at least 24 hours in advance

Best regards,
Healthcare Clinic Team
    `;

    // Log email sending attempt
    console.log('Attempting to send email to:', patientEmail);
    console.log('API Key present:', !!RESEND_API_KEY);
    console.log('API Key value:', RESEND_API_KEY ? `${RESEND_API_KEY.substring(0, 10)}...` : 'undefined');

    const emailPayload = {
      from: 'Healthcare Clinic <noreply@ivantasy.software>', // Use your verified domain
      to: [patientEmail],
      subject: `Appointment Confirmation - ${formattedDate} at ${formattedTime}`,
      html: htmlContent,
      text: textContent
    };

    console.log('Email payload:', { from: emailPayload.from, to: emailPayload.to, subject: emailPayload.subject });

    // Send email using Resend API
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    console.log('Resend API response status:', response.status);
    console.log('Resend API response ok:', response.ok);

    // Always try to get response body for debugging
    const responseText = await response.text();
    console.log('Resend API raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = { raw: responseText };
    }

    if (!response.ok) {
      console.error('Resend API error details:', result);
      throw new Error(result.message || result.error || 'Failed to send email');
    }

    console.log('Email sent successfully:', result);
    return { success: true, data: result };

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw error - we don't want to fail the booking if email fails
    return { success: false, error: error.message };
  }
};

/**
 * Send appointment cancellation email to patient
 * @param {Object} emailData - Email data
 * @param {string} emailData.patientEmail - Patient's email address
 * @param {string} emailData.patientName - Patient's full name
 * @param {string} emailData.doctorName - Doctor's full name
 * @param {string} emailData.appointmentTime - Appointment datetime (ISO string)
 * @param {string} emailData.cancelledBy - Who cancelled: 'patient' or 'doctor'
 * @returns {Promise<Object>} - Response from email service
 */
export const sendAppointmentCancellation = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentTime,
  cancelledBy
}) => {
  try {
    console.log('Sending cancellation email via Edge Function to:', patientEmail);
    console.log('Cancelled by:', cancelledBy);

    // Get the current session for auth
    const { data: { session } } = await supabase.auth.getSession();

    // Call the Edge Function
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        patientEmail,
        patientName,
        doctorName,
        appointmentTime,
        type: 'cancellation',
        cancelledBy
      })
    });

    console.log('Edge Function response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Edge Function error:', error);
      throw new Error(error.error || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Cancellation email sent successfully via Edge Function:', result);
    return { success: true, data: result };

  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send appointment reschedule email to patient
 * @param {Object} emailData - Email data
 * @param {string} emailData.patientEmail - Patient's email address
 * @param {string} emailData.patientName - Patient's full name
 * @param {string} emailData.doctorName - Doctor's full name
 * @param {string} emailData.appointmentTime - New appointment datetime (ISO string)
 * @param {string} emailData.oldAppointmentTime - Old appointment datetime (ISO string)
 * @param {string} emailData.specialty - Doctor's specialty
 * @param {string} emailData.rescheduledBy - Who rescheduled: 'patient' or 'doctor'
 * @returns {Promise<Object>} - Response from email service
 */
export const sendAppointmentReschedule = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentTime,
  oldAppointmentTime,
  specialty,
  rescheduledBy
}) => {
  try {
    console.log('Sending reschedule email via Edge Function to:', patientEmail);
    console.log('Old time:', oldAppointmentTime, '→ New time:', appointmentTime);

    // Get the current session for auth
    const { data: { session } } = await supabase.auth.getSession();

    // Call the Edge Function
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        patientEmail,
        patientName,
        doctorName,
        appointmentTime,
        oldAppointmentTime,
        specialty,
        rescheduledBy,
        type: 'reschedule'
      })
    });

    console.log('Edge Function response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Edge Function error:', error);
      throw new Error(error.error || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Reschedule email sent successfully via Edge Function:', result);
    return { success: true, data: result };

  } catch (error) {
    console.error('Error sending reschedule email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * OLD CANCELLATION IMPLEMENTATION - Keeping for reference
 */
const sendCancellationDirectlyOLD = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentTime
}) => {
  try {
    const appointmentDate = new Date(appointmentTime);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #dc3545;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">Appointment Cancelled</h1>
          </div>
          <div class="content">
            <p>Dear ${patientName},</p>
            <p>Your appointment has been cancelled as requested.</p>

            <p><strong>Cancelled Appointment:</strong></p>
            <ul>
              <li>Doctor: ${doctorName}</li>
              <li>Date: ${formattedDate}</li>
              <li>Time: ${formattedTime}</li>
            </ul>

            <p>If you would like to schedule a new appointment, please visit our booking page.</p>

            <p>Best regards,<br>Healthcare Clinic Team</p>
          </div>
        </body>
      </html>
    `;

    console.log('Attempting to send cancellation email to:', patientEmail);

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Healthcare Clinic <noreply@ivantasy.software>', // Use your verified domain
        to: [patientEmail],
        subject: `Appointment Cancelled - ${formattedDate}`,
        html: htmlContent
      })
    });

    console.log('Cancellation email response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error (cancellation):', error);
      throw new Error(error.message || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Cancellation email sent successfully:', result);
    return { success: true, data: result };

  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return { success: false, error: error.message };
  }
};
