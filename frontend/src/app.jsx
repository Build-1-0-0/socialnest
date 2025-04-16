import React, { useEffect, useState } from 'react';
import Profile from './components/Profile';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Try fetching the user's profile from the backend
    const fetchProfile = async () => {
      try {
        const res = await fetch('/profile');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleLogin = () => {
    window.location.href = '/login'; // Redirect to backend login
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Twitter OAuth with React</h1>
      {!user ? (
        <div>
          <p>You are not logged in.</p>
          <button onClick={handleLogin}>Login with Twitter</button>
        </div>
      ) : (
        <Profile user={user} />
      )}
    </div>
  );
};

export default App;
