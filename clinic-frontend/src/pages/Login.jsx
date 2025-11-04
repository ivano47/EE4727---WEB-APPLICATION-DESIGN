import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/my-dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to appropriate dashboard
      navigate('/my-dashboard');
    } catch (error) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left Column - Image/Branding */}
      <div className="hidden lg:flex items-center justify-center flex-col bg-gradient-to-br from-primary to-blue-700 p-12">
        <img 
          src="/qkntnoqkntnoqknt.webp" 
          alt="NTU Clinic Logo" 
          className="w-40 mb-6"
        />
        <h1 className="font-heading text-4xl font-bold text-white text-center">
          Your On-Campus Health Partner.
        </h1>
        <p className="font-sans text-lg text-blue-200 mt-2 text-center">
          Log in to manage your appointments.
        </p>
      </div>

      {/* Right Column - Form */}
      <div className="bg-white flex flex-col items-center justify-center min-h-screen py-12 px-8">
        <div className="max-w-md w-full">
          <img 
            src="/qkntnoqkntnoqknt.webp" 
            alt="NTU Clinic Logo" 
            className="lg:hidden h-24 mx-auto mb-4"
          />
          
          <h2 className="font-heading text-3xl font-bold text-primary text-center mb-6">
            Patient Login
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mt-4">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-primary focus:border-primary"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mt-4">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-primary focus:border-primary"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold transition-all mt-6 bg-red-900 text-white hover:bg-[#C41E3A] disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            <p>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
