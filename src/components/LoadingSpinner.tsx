import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      <p className="mt-4 text-white font-light">Processing your image...</p>
    </div>
  );
};

export default LoadingSpinner; 