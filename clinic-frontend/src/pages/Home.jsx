import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, profile } = useAuth()

  return (
    <div className="container-custom py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold text-primary md:text-5xl">
          Your On-Campus Health Partner
        </h1>
        <p className="font-sans text-lg text-gray-600 mt-4">
          Providing comprehensive medical and dental services to the NTU community.
        </p>
        <div className="flex justify-center items-center mt-8">
          <Link 
            to="/schedule" 
            className="bg-secondary text-white rounded-lg px-6 py-3 font-bold hover:bg-red-700 transition-all text-lg"
          >
            Book Appointment
          </Link>
          <Link 
            to="/our-doctors" 
            className="bg-transparent border border-primary text-primary rounded-lg px-6 py-3 font-bold hover:bg-primary hover:text-white transition-all text-lg ml-4"
          >
            Meet Our Doctors
          </Link>
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
