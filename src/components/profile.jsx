import React from 'react';

const Profile = ({ user }) => {
  return (
    <div>
      <h2>Welcome, {user.name || user.username}!</h2>
      <img src={user.profile_image_url} alt="Profile" style={{ borderRadius: '50%' }} />
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};

export default Profile;
