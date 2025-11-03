import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function TestFetch() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  const testDirectFetch = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const headers = {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      };

      console.log('Fetching with headers:', headers);
      
      const response = await fetch(
        'https://ctqtoxyqltydoxcwntgp.supabase.co/rest/v1/profiles?role=eq.doctor',
        { headers }
      );

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Fetch error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-8">Direct Fetch Test</h1>
      
      <div className="card mb-4">
        <div className="card-body">
          <p className="mb-4">Session exists: {session ? 'Yes' : 'No'}</p>
          <p className="mb-4">User ID: {session?.user?.id || 'None'}</p>
          
          <button 
            onClick={testDirectFetch}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Testing...' : 'Test Direct Fetch API'}
          </button>
        </div>
      </div>

      {result && (
        <div className="card">
          <div className="card-body">
            <h3 className="text-xl font-bold mb-4">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {result}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestFetch;
