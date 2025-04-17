import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy-loaded components
const Home = lazy(() => import('./components/Home'));
const Profile = lazy(() => import('./components/profile'));
const NotFound = lazy(() => import('./components/NotFound'));
const TwitterCallback = lazy(() => import('./components/TwitterCallback')); // Create this if needed

function App() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth/twitter/callback" element={<TwitterCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
