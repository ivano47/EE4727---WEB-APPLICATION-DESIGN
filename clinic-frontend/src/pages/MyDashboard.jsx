import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { sendAppointmentCancellation } from '../services/emailService';

function MyDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctor_user_id (
            full_name,
            specialty,
            email
          ),
          patient:patient_user_id (
            full_name,
            email
          )
        `)
        .eq('patient_user_id', user.id)
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      setError('Failed to load appointments. Please try again later.');
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      // Find the appointment to get details for email
      const appointment = appointments.find(a => a.id === appointmentId);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Update appointment status and track who cancelled
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancelled_by: 'patient'
        })
        .eq('id', appointmentId);

      if (error) throw error;

      // Send cancellation email to patient
      sendAppointmentCancellation({
        patientEmail: user.email,
        patientName: appointment.patient?.full_name || user.email,
        doctorName: appointment.doctor?.full_name || 'Doctor',
        appointmentTime: appointment.appointment_time,
        cancelledBy: 'patient'
      }).then(result => {
        if (result.success) {
          console.log('Cancellation email sent successfully');
        } else {
          console.warn('Failed to send cancellation email:', result.error);
        }
      }).catch(error => {
        console.error('Error sending cancellation email:', error);
      });

      alert('Appointment cancelled successfully. A confirmation email has been sent.');

      // Refresh appointments list
      fetchAppointments();
    } catch (error) {
      alert('Failed to cancel appointment. Please try again.');
      console.error('Error cancelling appointment:', error);
    }
  };

  const handleRescheduleAppointment = (appointmentId) => {
    // Navigate to schedule page with reschedule mode
    navigate(`/schedule?reschedule_id=${appointmentId}`);
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      scheduled: 'text-blue-600',
      completed: 'text-highlight',
      cancelled: 'text-gray-500',
      'no-show': 'text-yellow-600',
    };

    return (
      <span className={`font-semibold ${statusClasses[status] || 'text-gray-600'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const isPastAppointment = (dateTimeString) => {
    return new Date(dateTimeString) < new Date();
  };

  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Dashboard</h1>
        <p className="text-lg text-gray-600">View and manage your appointments</p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="spinner border-blue-600"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              You don't have any appointments yet.
            </p>
            <a href="/schedule" className="btn btn-primary">
              Book an Appointment
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="py-3 px-4 font-heading">Date & Time</th>
                  <th className="py-3 px-4 font-heading">Doctor</th>
                  <th className="py-3 px-4 font-heading">Specialty</th>
                  <th className="py-3 px-4 font-heading">Status</th>
                  <th className="py-3 px-4 font-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="py-3 px-4 border-b">
                      <div className="font-medium">
                        {formatDateTime(appointment.appointment_time)}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      {appointment.doctor?.full_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 border-b">
                      {appointment.doctor?.specialty || 'N/A'}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div>
                        {getStatusBadge(appointment.status)}
                        {appointment.rescheduled_by && appointment.status === 'scheduled' && (
                          <div className="text-xs text-gray-500 mt-1">
                            Rescheduled by {appointment.rescheduled_by === 'patient' ? 'you' : 'doctor'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      {appointment.status === 'scheduled' &&
                        !isPastAppointment(appointment.appointment_time) && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleRescheduleAppointment(appointment.id)
                              }
                              className="bg-highlight text-white px-3 py-1 rounded hover:opacity-90 transition-all text-sm font-medium"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() =>
                                handleCancelAppointment(appointment.id)
                              }
                              className="bg-secondary text-white px-3 py-1 rounded hover:opacity-90 transition-all text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      {appointment.status === 'cancelled' && (
                        <div className="text-gray-400 text-sm">
                          <span>Cancelled</span>
                          {appointment.cancelled_by && (
                            <span className="block text-xs mt-1">
                              by {appointment.cancelled_by === 'patient' ? 'you' : 'doctor'}
                            </span>
                          )}
                        </div>
                      )}
                      {appointment.status === 'completed' && (
                        <span className="text-gray-400 text-sm">
                          Completed
                        </span>
                      )}
                      {isPastAppointment(appointment.appointment_time) &&
                        appointment.status === 'scheduled' && (
                          <span className="text-gray-400 text-sm">Past</span>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6">
        <a href="/schedule" className="btn btn-primary">
          Book New Appointment
        </a>
      </div>
    </div>
  );
}

export default MyDashboard;
