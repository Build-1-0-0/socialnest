import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Welcome to the App</h1>
        <p className="text-gray-700 mb-6">
          Connect your Twitter account to get started.
        </p>
        <a
          href="/login"
          className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Login with Twitter
        </a>
      </div>
    </div>
  );
};

export default Home;