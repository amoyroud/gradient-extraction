import React, { useState, useEffect } from 'react';
import App from './App';
import LandingPage from './components/LandingPage';

const Router: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.hash.substring(1) || '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.substring(1));
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Set loading to false after a short delay to ensure components have time to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      clearTimeout(timer);
    };
  }, []);
  
  // If still loading, render a minimal loading indicator within the React app
  // This prevents the fallback HTML from showing during transitions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-100">Loading...</h2>
        </div>
      </div>
    );
  }
  
  // Always show the App component, which contains our PremiumLanding
  return (
    <>
      <App />
    </>
  );
};

export default Router; 