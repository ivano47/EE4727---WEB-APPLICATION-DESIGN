import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

const ProfilePage = () => {
  const { user, profile: authProfile, loading: authLoading, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (authProfile) {
      setFullName(authProfile.full_name || '');
      setBio(authProfile.bio || '');
      setSpecialty(authProfile.specialty || '');
      setPhone(authProfile.phone_number || '');
      setAvatarUrl(authProfile.avatar_url);
      setEmail(authProfile.email || '');
    }
  }, [authProfile]);

  const updateProfile = async (event) => {
    event.preventDefault();

    if (window.confirm('Are you sure you want to update your profile?')) {
      try {
        setLoading(true);
        const updates = {
          user_id: user.id,
          full_name: fullName,
          email: email,
          role: authProfile.role,
          bio,
          specialty,
          phone_number: phone,
          avatar_url: avatarUrl,
          updated_at: new Date(),
        };

        const { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'user_id' });

        if (error) {
          throw error;
        }
        alert('Profile updated successfully!');
        refreshProfile(); // Refresh the profile in context
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold text-primary text-center mb-8">Edit Profile</h1>
      {authLoading || !authProfile ? (
        <p className="text-center">Loading profile...</p>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <form onSubmit={updateProfile} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <Avatar
                url={avatarUrl}
                userId={user.id}
                onUpload={(filePath) => {
                  setAvatarUrl(filePath);
                  // Optionally trigger updateProfile here if avatar change should be immediate
                }}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={email || ''}
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-primary focus:border-primary disabled:bg-gray-100"
                disabled
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName || ''}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                id="phone"
                type="text"
                value={phone || ''}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-primary focus:border-primary"
              />
            </div>

            {authProfile?.role === 'doctor' && (
              <>
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Specialty</label>
                  <input
                    id="specialty"
                    type="text"
                    value={specialty || ''}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    id="bio"
                    value={bio || ''}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || authLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-secondary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;