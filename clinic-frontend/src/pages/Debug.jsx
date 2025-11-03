import { useAuth } from '../context/AuthContext';

function Debug() {
  const { user, session, profile, loading } = useAuth();

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-8">Debug Info</h1>
      
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="text-xl font-bold mb-4">Loading State</h2>
          <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="text-xl font-bold mb-4">User</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="text-xl font-bold mb-4">Session</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="text-xl font-bold mb-4">Profile</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default Debug;
