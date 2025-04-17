import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TwitterCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // This is where you'd fetch the user token or handle session
    // Example: fetch("/api/get-user") or check cookies, etc.
    // Then redirect
    navigate('/profile');
  }, [navigate]);

  return <div className="p-4 text-center">Signing in...</div>;
}

export default TwitterCallback;
