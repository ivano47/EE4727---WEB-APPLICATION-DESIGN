import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

function Schedule() {
  const [searchParams] = useSearchParams();
  const rescheduleId = searchParams.get('reschedule_id');
  
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [doctorSchedule, setDoctorSchedule] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Redirect doctors who try to book new appointments
  useEffect(() => {
    if (profile?.role === 'doctor' && !rescheduleId) {
      navigate('/doctor-dashboard?error=doctors_cannot_book');
    }
  }, [profile, rescheduleId, navigate]);

  // Fetch doctors
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch doctor schedule and booked slots when doctor/date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchDoctorSchedule();
      fetchBookedSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors for schedule...');
      
      // Add timeout for query
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const queryPromise = supabase
        .from('profiles')
        .select('user_id, full_name, specialty')
        .eq('role', 'doctor')
        .order('full_name');

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('Doctors fetch result:', { data, error });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Set empty array instead of showing error - the page will still work
      setDoctors([]);
      setError('Having trouble loading doctors. Please try refreshing the page.');
    }
  };

  const fetchDoctorSchedule = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const queryPromise = supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_user_id', selectedDoctor);

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) throw error;
      setDoctorSchedule(data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const fetchBookedSlots = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const queryPromise = supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_user_id', selectedDoctor)
        .gte('appointment_time', `${selectedDate}T00:00:00`)
        .lt('appointment_time', `${selectedDate}T23:59:59`)
        .eq('status', 'scheduled');

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) throw error;
      setBookedSlots((data || []).map(slot => slot.appointment_time));
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };

  const handleBookAppointment = async (appointmentTime) => {
    if (!user || !selectedDoctor) return;

    try {
      setLoading(true);
      setError('');

      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_user_id: user.id,
          doctor_user_id: selectedDoctor,
          appointment_time: appointmentTime,
          status: 'scheduled'
        });

      if (error) throw error;

      alert('Appointment booked successfully!');
      navigate('/my-dashboard');
    } catch (error) {
      setError('Failed to book appointment. Please try again.');
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar = [];
    let day = 1;

    // Generate 6 weeks (max needed for any month)
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        if ((week === 0 && dayOfWeek < startingDayOfWeek) || day > daysInMonth) {
          weekDays.push(null);
        } else {
          weekDays.push(day);
          day++;
        }
      }
      calendar.push(weekDays);
      if (day > daysInMonth) break;
    }

    return calendar;
  };

  const isDateAvailable = (day) => {
    if (!day || !selectedDoctor) return false;
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return false;

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    return doctorSchedule.some(schedule => schedule.day_of_week === dayOfWeek);
  };

  const generateTimeSlots = () => {
    if (!selectedDate || !selectedDoctor) return [];

    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    const schedule = doctorSchedule.find(s => s.day_of_week === dayOfWeek);

    if (!schedule) return [];

    const slots = [];
    const startTime = new Date(`2000-01-01T${schedule.start_time}`);
    const endTime = new Date(`2000-01-01T${schedule.end_time}`);

    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      const appointmentDateTime = `${selectedDate}T${timeString}:00`;
      
      slots.push({
        time: currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        datetime: appointmentDateTime,
        isBooked: bookedSlots.includes(appointmentDateTime)
      });

      currentTime.setHours(currentTime.getHours() + 1);
    }

    return slots;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const calendar = generateCalendar();
  const timeSlots = generateTimeSlots();
  const selectedDoctorData = doctors.find(d => d.user_id === selectedDoctor);

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Schedule an Appointment</h1>
      
      {rescheduleId ? (
        <p className="text-lg text-gray-600 mb-8">
          You are rescheduling your appointment. Please select a new date and time.
        </p>
      ) : (
        <p className="text-lg text-gray-600 mb-8">
          Welcome, {profile?.full_name}! Select a doctor and date to view available time slots.
        </p>
      )}

      {error && (
        <div className="alert alert-error mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Doctor Selection */}
      <div className="card mb-8">
        <div className="card-body">
          <label className="form-label">Select Doctor:</label>
          <select
            value={selectedDoctor || ''}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="form-input"
            disabled={rescheduleId}
          >
            <option value="">-- Choose a Doctor --</option>
            {doctors.map((doctor) => (
              <option key={doctor.user_id} value={doctor.user_id}>
                {doctor.full_name} - {doctor.specialty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedDoctor && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="card">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="btn btn-outline">
                  ← Previous
                </button>
                <h3 className="text-xl font-bold">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={handleNextMonth} className="btn btn-outline">
                  Next →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="font-medium text-gray-500 text-sm">
                    {day}
                  </div>
                ))}

                {calendar.map((week, weekIdx) =>
                  week.map((day, dayIdx) => {
                    if (!day) {
                      return <div key={`${weekIdx}-${dayIdx}`} className="p-2"></div>;
                    }

                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isAvailable = isDateAvailable(day);
                    const isSelected = dateStr === selectedDate;

                    return (
                      <button
                        key={`${weekIdx}-${dayIdx}`}
                        onClick={() => isAvailable && setSelectedDate(dateStr)}
                        disabled={!isAvailable}
                        className={`p-2 rounded ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold'
                            : isAvailable
                            ? 'bg-white hover:bg-blue-50 border border-gray-300'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-xl font-bold mb-4">
                Available Time Slots
                {selectedDoctorData && ` for ${selectedDoctorData.full_name}`}
              </h3>
              <p className="text-gray-600 mb-4">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>

              {timeSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No available time slots for this date.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.datetime}
                      onClick={() => handleBookAppointment(slot.datetime)}
                      disabled={slot.isBooked || loading}
                      className={`p-3 rounded text-center ${
                        slot.isBooked
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'btn btn-primary'
                      }`}
                    >
                      {slot.time}
                      {slot.isBooked && <div className="text-xs">Booked</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;
