import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        setProfile(null);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Your Twitter Profile</h1>
      <div className="border rounded p-4 shadow-md">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Username:</strong> @{profile.username}</p>
        <p><strong>ID:</strong> {profile.id}</p>
      </div>
    </div>
  );
};

export default Profile;
