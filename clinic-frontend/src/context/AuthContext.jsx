import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start by setting loading to true
    setLoading(true);

    // 1. Get the current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session) {
        // 2. If a session exists, fetch the user's profile using direct fetch
        try {
          const headers = {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          };

          const response = await fetch(
            `https://ctqtoxyqltydoxcwntgp.supabase.co/rest/v1/profiles?user_id=eq.${session.user.id}&limit=1`,
            { headers }
          );

          if (response.ok) {
            const data = await response.json();
            const userProfile = data && data.length > 0 ? data[0] : null;
            setProfile(userProfile);
          } else {
            console.error('Profile fetch failed:', response.status);
            setProfile(null);
          }
        } catch (err) {
          console.error('Exception fetching profile:', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    getSession();

    // 3. Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== Auth state changed ===', event, session ? 'session exists' : 'no session', 'user:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        console.log('Checking event condition - event:', event, 'has session:', !!session);
        
        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
          // User has a session, fetch their profile using direct fetch
          console.log('✅ Fetching profile for user:', session.user.id);
          setLoading(true);
          
          try {
            const headers = {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            };

            const response = await fetch(
              `https://ctqtoxyqltydoxcwntgp.supabase.co/rest/v1/profiles?user_id=eq.${session.user.id}&limit=1`,
              { headers }
            );

            if (response.ok) {
              const data = await response.json();
              const userProfile = data && data.length > 0 ? data[0] : null;
              console.log('Profile fetch result:', userProfile);
              
              // If no profile exists, try to create one from user metadata
              if (!userProfile && session?.user) {
                console.log('No profile found, attempting to create from user metadata...');
                try {
                  const userMeta = session.user.user_metadata || {};
                  const profileData = {
                    user_id: session.user.id,
                    full_name: userMeta.full_name || userMeta.first_name + ' ' + userMeta.last_name || session.user.email,
                    email: session.user.email,
                    role: userMeta.role || 'patient',
                    phone_number: userMeta.phone_number,
                    date_of_birth: userMeta.date_of_birth
                  };
                  
                  const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert(profileData)
                    .select()
                    .single();
                  
                  if (!insertError && newProfile) {
                    console.log('Profile created successfully:', newProfile);
                    setProfile(newProfile);
                  } else {
                    console.error('Failed to create profile:', insertError);
                    setProfile(null);
                  }
                } catch (createError) {
                  console.error('Exception creating profile:', createError);
                  setProfile(null);
                }
              } else {
                setProfile(userProfile);
              }
            } else {
              console.error('Profile fetch failed:', response.status);
              setProfile(null);
            }
          } catch (err) {
            console.error('Exception fetching profile:', err);
            setProfile(null);
          }
          setLoading(false);
        } else if (event === 'SIGNED_OUT' || !session) {
          // User signed out or no session, clear profile
          setProfile(null);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, userData) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (authError) throw authError;

      return { data: authData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log('signOut called in AuthContext');
    try {
      console.log('About to call supabase.auth.signOut()');
      const result = await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SignOut timeout')), 5000)
        )
      ]);
      console.log('SignOut result:', result);
      
      if (result.error) {
        console.error('Supabase signOut error:', result.error);
        throw result.error;
      }
      console.log('Supabase signOut successful');
      setUser(null);
      setSession(null);
      setProfile(null);
      return { success: true };
    } catch (error) {
      console.error('Error in signOut:', error);
      // Force clear the session anyway
      setUser(null);
      setSession(null);
      setProfile(null);
      // Try to clear local storage manually - clear all supabase keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      // Don't throw - we've cleared the session
      return { success: false, error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

