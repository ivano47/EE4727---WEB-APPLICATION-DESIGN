import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, today, upcoming
  const { user } = useAuth();

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
          patient:patient_user_id (
            full_name,
            email
          )
        `)
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

  const handleCompleteAppointment = async (appointmentId) => {
    if (!confirm('Mark this appointment as completed?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (error) throw error;

      // Refresh appointments list
      fetchAppointments();
    } catch (error) {
      alert('Failed to complete appointment. Please try again.');
      console.error('Error completing appointment:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      // Refresh appointments list
      fetchAppointments();
    } catch (error) {
      alert('Failed to cancel appointment. Please try again.');
      console.error('Error cancelling appointment:', error);
    }
  };

  const handleRescheduleAppointment = (appointmentId) => {
    // TODO: Implement reschedule functionality
    alert('Reschedule functionality coming soon!');
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

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
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

  const isToday = (dateTimeString) => {
    const today = new Date();
    const appointmentDate = new Date(dateTimeString);
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === 'today') {
      return isToday(appointment.appointment_time) && appointment.status === 'scheduled';
    }
    if (filter === 'upcoming') {
      return !isPastAppointment(appointment.appointment_time) && appointment.status === 'scheduled';
    }
    return true; // 'all'
  });

  const todayCount = appointments.filter(
    (a) => isToday(a.appointment_time) && a.status === 'scheduled'
  ).length;

  const upcomingCount = appointments.filter(
    (a) => !isPastAppointment(a.appointment_time) && a.status === 'scheduled'
  ).length;

  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
        <p className="text-lg text-gray-600">Manage your appointments and patient schedule</p>
        <div className="flex space-x-4 mt-4"> {/* Added flex container */}
          <Link
            to="/profile"
            className="bg-transparent border border-primary text-primary rounded-lg px-6 py-2 font-bold hover:bg-primary hover:text-white transition-all"
          >
            Edit Profile
          </Link>
          {/* Assuming there was a "Book New Appointment" button here, if not, this is where it would go. */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Today's Appointments</h3>
            <p className="text-3xl font-bold text-blue-600">{todayCount}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Upcoming Appointments</h3>
            <p className="text-3xl font-bold text-green-600">{upcomingCount}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Appointments</h3>
            <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
        >
          All Appointments
        </button>
        <button
          onClick={() => setFilter('today')}
          className={`btn ${filter === 'today' ? 'btn-primary' : 'btn-outline'}`}
        >
          Today ({todayCount})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
        >
          Upcoming ({upcomingCount})
        </button>
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
      ) : filteredAppointments.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <p className="text-gray-500 text-lg">
              {filter === 'today'
                ? 'No appointments scheduled for today.'
                : filter === 'upcoming'
                ? 'No upcoming appointments.'
                : 'No appointments found.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="py-3 px-4 font-heading">Date</th>
                  <th className="py-3 px-4 font-heading">Time</th>
                  <th className="py-3 px-4 font-heading">Patient</th>
                  <th className="py-3 px-4 font-heading">Email</th>
                  <th className="py-3 px-4 font-heading">Status</th>
                  <th className="py-3 px-4 font-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="py-3 px-4 border-b">
                      <div className="font-medium">
                        {formatDate(appointment.appointment_time)}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="font-medium">
                        {formatTime(appointment.appointment_time)}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      {appointment.patient?.full_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 border-b text-sm text-gray-600">
                      {appointment.patient?.email || 'N/A'}
                    </td>
                    <td className="py-3 px-4 border-b">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="py-3 px-4 border-b">
                      {appointment.status === 'scheduled' &&
                        !isPastAppointment(appointment.appointment_time) && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleCompleteAppointment(appointment.id)
                              }
                              className="bg-highlight text-white px-3 py-1 rounded hover:opacity-90 transition-all text-sm font-medium"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() =>
                                handleRescheduleAppointment(appointment.id)
                              }
                              className="border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition-all text-sm font-medium"
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
                        <span className="text-gray-400 text-sm">
                          Cancelled
                        </span>
                      )}
                      {appointment.status === 'completed' && (
                        <span className="text-green-600 text-sm font-medium">
                          ✓ Completed
                        </span>
                      )}
                      {isPastAppointment(appointment.appointment_time) &&
                        appointment.status === 'scheduled' && (
                          <button
                            onClick={() =>
                              handleCompleteAppointment(appointment.id)
                            }
                            className="btn btn-success text-sm py-1 px-3"
                          >
                            Mark Complete
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
