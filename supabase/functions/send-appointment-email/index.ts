// Supabase Edge Function to send appointment confirmation emails via Resend
// This runs server-side, avoiding CORS issues

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  patientEmail: string
  patientName: string
  doctorName: string
  appointmentTime: string
  specialty?: string
  type?: 'confirmation' | 'cancellation' | 'reschedule'
  cancelledBy?: 'patient' | 'doctor'
  rescheduledBy?: 'patient' | 'doctor'
  oldAppointmentTime?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const emailData: EmailRequest = await req.json()

    // Validate required fields
    if (!emailData.patientEmail || !emailData.appointmentTime) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Format the appointment date and time
    const appointmentDate = new Date(emailData.appointmentTime)
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    // Determine email type
    const emailType = emailData.type || 'confirmation'

    // Email HTML template
    let htmlContent = ''

    if (emailType === 'reschedule') {
      // Format old appointment time
      const oldAppointmentDate = new Date(emailData.oldAppointmentTime || emailData.appointmentTime)
      const oldFormattedDate = oldAppointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const oldFormattedTime = oldAppointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })

      htmlContent = `
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
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
                border-left: 4px solid #f59e0b;
              }
              .old-time {
                background: #fee2e2;
                padding: 15px;
                border-radius: 6px;
                margin: 10px 0;
                text-decoration: line-through;
                color: #991b1b;
              }
              .new-time {
                background: #d1fae5;
                padding: 15px;
                border-radius: 6px;
                margin: 10px 0;
                color: #065f46;
                font-weight: bold;
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
                color: #f59e0b;
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
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">Appointment Rescheduled</h1>
            </div>
            <div class="content">
              <p>Dear ${emailData.patientName || 'Patient'},</p>
              <p>${emailData.rescheduledBy === 'doctor'
                ? 'Your appointment has been rescheduled by your doctor.'
                : 'Your appointment has been successfully rescheduled.'}</p>

              <div class="appointment-details">
                <h2 style="margin-top: 0; color: #f59e0b;">Updated Appointment Details</h2>

                <div class="detail-row">
                  <span class="label">Doctor:</span>
                  <span>${emailData.doctorName || 'Doctor'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Specialty:</span>
                  <span>${emailData.specialty || 'General Practice'}</span>
                </div>
                ${emailData.rescheduledBy ? `
                <div class="detail-row">
                  <span class="label">Rescheduled by:</span>
                  <span>${emailData.rescheduledBy === 'doctor' ? 'Doctor' : 'You'}</span>
                </div>
                ` : ''}

                <div style="margin-top: 20px;">
                  <div class="old-time">
                    <strong>Previous Time:</strong><br>
                    ${oldFormattedDate} at ${oldFormattedTime}
                  </div>
                  <div style="text-align: center; margin: 10px 0; font-size: 24px;">↓</div>
                  <div class="new-time">
                    <strong>New Time:</strong><br>
                    ${formattedDate} at ${formattedTime}
                  </div>
                </div>
              </div>

              <p><strong>Important Information:</strong></p>
              <ul>
                <li>Please arrive 15 minutes before your scheduled appointment time</li>
                <li>Bring along your NRIC/driving license for identification.</li>
                <li>If you need to reschedule again, please contact us at least 24 hours in advance, or visit our website for appointment needs.</li>
              </ul>

              <p>If you have any questions, please don't hesitate to contact us.</p>

              <p>Best regards,<br>NTU Clinic Team</p>
            </div>
            <div class="footer">
              <p>This is an automated notification email. Please do not reply to this message.</p>
            </div>
          </body>
        </html>
      `
    } else if (emailType === 'confirmation') {
      htmlContent = `
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">Appointment Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${emailData.patientName || 'Patient'},</p>
            <p>Your appointment has been successfully scheduled. We look forward to seeing you!</p>

            <div class="appointment-details">
              <h2 style="margin-top: 0; color: #667eea;">Appointment Details</h2>
              <div class="detail-row">
                <span class="label">Doctor:</span>
                <span>${emailData.doctorName || 'Doctor'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Specialty:</span>
                <span>${emailData.specialty || 'General Practice'}</span>
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
              <li>Bring along your NRIC/driving license for identification.</li>
              <li>If you need to reschedule or cancel, please contact us at least 24 hours in advance, or visit our website for appointment needs.</li>
            </ul>

            <p>If you have any questions, please don't hesitate to contact us.</p>

            <p>Best regards,<br>NTU Clinic Team</p>
          </div>
          <div class="footer">
            <p>This is an automated confirmation email. Please do not reply to this message.</p>
          </div>
        </body>
      </html>
    `
    } else {
      // Cancellation email
      htmlContent = `
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
            <p>Dear ${emailData.patientName || 'Patient'},</p>
            <p>${emailData.cancelledBy === 'doctor'
              ? 'We regret to inform you that your appointment has been cancelled by the doctor.'
              : 'Your appointment has been cancelled as requested.'}</p>

            <p><strong>Cancelled Appointment Details:</strong></p>
            <ul>
              <li>Doctor: ${emailData.doctorName || 'Doctor'}</li>
              <li>Date: ${formattedDate}</li>
              <li>Time: ${formattedTime}</li>
              ${emailData.cancelledBy ? `<li>Cancelled by: ${emailData.cancelledBy === 'doctor' ? 'Doctor' : 'You'}</li>` : ''}
            </ul>

            ${emailData.cancelledBy === 'doctor'
              ? '<p>We apologize for any inconvenience. If you have questions, please contact us.</p>'
              : '<p>If you would like to schedule a new appointment, please visit our booking page.</p>'}

            <p>Best regards,<br>NTU Clinic Team</p>
          </div>
        </body>
      </html>
      `
    }

    // Send email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'NTU Clinic <ntu-clinic_scheduling@ivantasy.software>',
        to: [emailData.patientEmail],
        subject: emailType === 'confirmation'
          ? `Appointment Confirmation - ${formattedDate} at ${formattedTime}`
          : emailType === 'reschedule'
          ? `Appointment Rescheduled - ${formattedDate} at ${formattedTime}`
          : `Appointment Cancelled - ${formattedDate}`,
        html: htmlContent
      })
    })

    if (!resendResponse.ok) {
      const error = await resendResponse.json()
      console.error('Resend API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const result = await resendResponse.json()

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in send-appointment-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
