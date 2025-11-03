import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import DoctorCard from '../components/DoctorCard';

function OurDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      console.log('Fetching doctors...');
      
      // Get token directly from localStorage - bypass Supabase client
      let authToken = import.meta.env.VITE_SUPABASE_ANON_KEY;
      try {
        const keys = Object.keys(localStorage).filter(key => key.includes('supabase.auth.token'));
        if (keys.length > 0) {
          const sessionData = localStorage.getItem(keys[0]);
          if (sessionData) {
            const parsed = JSON.parse(sessionData);
            authToken = parsed.access_token || parsed.currentSession?.access_token || authToken;
          }
        }
      } catch (e) {
        console.log('Could not get auth token, using anon key');
      }
      
      const headers = {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };

      console.log('Fetching with headers...');
      const response = await fetch(
        'https://ctqtoxyqltydoxcwntgp.supabase.co/rest/v1/profiles?role=eq.doctor&order=full_name.asc',
        { headers }
      );

      console.log('Response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      console.log('Doctors fetch result:', data);

      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again later.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Doctors</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Meet our team of experienced and dedicated healthcare professionals
          committed to providing you with the best medical care.
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-8">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="spinner border-blue-600"></div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No doctors found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}

export default OurDoctors;
