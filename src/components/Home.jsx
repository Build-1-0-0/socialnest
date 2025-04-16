import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Welcome</h1>
      <p>Click below to login with Twitter:</p>
      <a
        href="/login"
        className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Login with Twitter
      </a>
    </div>
  );
};

export default Home;
