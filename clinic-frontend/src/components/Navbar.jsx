import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      navigate('/login');
    }
  }

  return (
    <nav className="bg-white shadow-md w-full relative z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4">
        {/* Logo */}
        <Link to="/">
          <img 
            src="/qkntnoqkntnoqknt.webp" 
            alt="NTU Clinic" 
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="font-medium text-gray-600 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/our-doctors" className="font-medium text-gray-600 hover:text-primary transition-colors">
            Our Doctors
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {profile?.role === 'doctor' ? (
            <>
              <Link 
                to="/doctor-dashboard" 
                className="bg-secondary text-white rounded-lg px-4 py-2 font-bold hover:bg-red-700 transition-all"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleSignOut} 
                className="bg-transparent border border-primary text-primary rounded-lg px-4 py-2 font-bold hover:bg-primary hover:text-white transition-all"
                type="button"
              >
                Logout
              </button>
            </>
          ) : profile?.role === 'patient' ? (
            <>
              <Link 
                to="/my-dashboard" 
                className="bg-secondary text-white rounded-lg px-4 py-2 font-bold hover:bg-red-700 transition-all"
              >
                My Appointments
              </Link>
              <button 
                onClick={handleSignOut} 
                className="bg-transparent border border-primary text-primary rounded-lg px-4 py-2 font-bold hover:bg-primary hover:text-white transition-all"
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="bg-transparent border border-primary text-primary rounded-lg px-4 py-2 font-bold hover:bg-primary hover:text-white transition-all"
              >
                Login
              </Link>
              <Link 
                to="/schedule" 
                className="bg-secondary text-white rounded-lg px-4 py-2 font-bold hover:bg-red-700 transition-all"
              >
                Book Appointment
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-primary"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg py-4">
          <Link 
            to="/" 
            className="block py-2 px-4 text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/our-doctors" 
            className="block py-2 px-4 text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Our Doctors
          </Link>

          <div className="mt-4 px-4 space-y-3">
            {profile?.role === 'doctor' ? (
              <>
                <Link 
                  to="/doctor-dashboard" 
                  className="w-full text-center block bg-secondary text-white rounded-lg px-4 py-2 font-bold hover:bg-red-700 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={(e) => {
                    setIsOpen(false);
                    handleSignOut(e);
                  }} 
                  className="w-full text-center bg-transparent border border-primary text-primary rounded-lg px-4 py-2 font-bold hover:bg-primary hover:text-white transition-all"
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : profile?.role === 'patient' ? (
              <>
                <Link 
                  to="/my-dashboard" 
                  className="w-full text-center block bg-secondary text-white rounded-lg px-4 py-2 font-bold hover:bg-red-700 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  My Appointments
                </Link>
                <button 
                  onClick={(e) => {
                    setIsOpen(false);
                    handleSignOut(e);
                  }} 
                  className="w-full text-center bg-transparent border border-primary text-primary rounded-lg px-4 py-2 font-bold hover:bg-primary hover:text-white transition-all"
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="w-full text-center block bg-transparent border border-primary text-primary rounded-lg px-4 py-2 font-bold hover:bg-primary hover:text-white transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/schedule" 
                  className="w-full text-center block bg-secondary text-white rounded-lg px-4 py-2 font-bold hover:bg-red-700 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Book Appointment
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
