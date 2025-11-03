import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate('/my-dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            date_of_birth: dateOfBirth,
          },
        },
      });

      if (error) throw error;

      console.log('SignUp data:', data);

      // Create profile record for the new user
      if (data.user) {
        console.log('Creating profile for user:', data.user.id);
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            full_name: `${firstName} ${lastName}`,
            email: email,
            role: 'patient',
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't throw error, profile can be created later
        } else {
          console.log('Profile created successfully');
        }
      } else {
        console.log('No user in response - profile will be created on email confirmation');
      }

      setSuccess('Registration successful! Please check your email to verify your account.');
      
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setPhoneNumber('');
      setDateOfBirth('');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.message || 'An error occurred during registration');
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
          Sign up to get started.
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
            Patient Registration
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mt-4">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-primary focus:border-primary"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mt-4">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-primary focus:border-primary"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

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
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mt-4">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                required
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-primary focus:border-primary"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mt-4">
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                required
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-primary focus:border-primary"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mt-4">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-primary focus:border-primary"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold transition-all mt-6 bg-red-900 text-white hover:bg-[#C41E3A] disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            <p>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
