import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
      <Link to="/" className="text-blue-500 hover:underline">Go back to Home</Link>
    </div>
  );
};

export default NotFound;
