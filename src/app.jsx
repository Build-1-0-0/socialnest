import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy-loaded pages
const Home = lazy(() => import('./components/Home'));
const profile = lazy(() => import('./components/profile'));
const NotFound = lazy(() => import('./components/NotFound'));

function App() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
