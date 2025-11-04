import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import DoctorCard from '../components/DoctorCard'

export default function Home() {
  const { user, profile } = useAuth()
  const [doctors, setDoctors] = useState([])

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
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

        const response = await fetch(
          'https://ctqtoxyqltydoxcwntgp.supabase.co/rest/v1/profiles?role=eq.doctor&order=full_name.asc&limit=3',
          { headers }
        );

        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setDoctors(data || []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    }

    fetchDoctors()
  }, [])

  return (
    <div className="container-custom py-12">
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-7xl mx-auto py-12 px-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-primary md:text-5xl">
            Your On-Campus Health Partner
          </h1>
          <p className="font-sans text-lg text-gray-600 mt-4">
            Providing comprehensive medical and dental services to the NTU community.
          </p>
          <div className="flex mt-8 space-x-4">
            <Link 
              to="/schedule" 
              className="bg-secondary text-white rounded-lg px-6 py-3 font-bold hover:bg-red-700 transition-all text-lg"
            >
              Book Appointment
            </Link>
            <Link 
              to="/our-doctors" 
              className="bg-transparent border border-primary text-primary rounded-lg px-6 py-3 font-bold hover:bg-primary hover:text-white transition-all text-lg"
            >
              Meet Our Doctors
            </Link>
          </div>
        </div>
        <div>
          <img 
            src="/dsc_0531_rz_web.jpg" 
            alt="Clinic Interior" 
            className="rounded-lg shadow-xl" 
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="text-center">
          <div className="text-highlight text-6xl mb-4">🏥</div>
          <h3 className="font-heading text-xl font-bold text-primary mt-4">Expert Care</h3>
          <p className="text-gray-600 mt-2">
            Our team of experienced doctors provides comprehensive healthcare services.
          </p>
        </div>

        <div className="text-center">
          <div className="text-highlight text-6xl mb-4">📅</div>
          <h3 className="font-heading text-xl font-bold text-primary mt-4">Easy Booking</h3>
          <p className="text-gray-600 mt-2">
            Schedule appointments online at your convenience, 24/7.
          </p>
        </div>

        <div className="text-center">
          <div className="text-highlight text-6xl mb-4">⚡</div>
          <h3 className="font-heading text-xl font-bold text-primary mt-4">Fast Service</h3>
          <p className="text-gray-600 mt-2">
            Minimal wait times and efficient appointment management.
          </p>
        </div>
      </div>

      {/* Meet Our Doctors Section */}
      <div className="py-12">
        <h2 className="font-heading text-3xl font-bold text-primary text-center">
          Meet Our Doctors
        </h2>
        <p className="font-sans text-lg text-gray-600 text-center mt-4 max-w-2xl mx-auto">
          Our team of experienced professionals
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {doctors.map(doctor => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center bg-primary rounded-lg p-8">
        <h2 className="font-heading text-3xl font-bold text-white">
          Ready to Get Started?
        </h2>
        <p className="font-sans text-gray-200 mt-2">
          Join hundreds of satisfied patients who trust NTU Clinic for their healthcare needs.
        </p>
        <Link 
          to="/our-doctors" 
          className="inline-block bg-white text-primary rounded-lg px-6 py-3 font-bold hover:bg-gray-200 transition-all text-lg mt-6"
        >
          Meet Our Doctors
        </Link>
      </div>
    </div>
  )
}
