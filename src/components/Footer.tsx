import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 py-6 mt-12">
      <div className="container mx-auto px-4">
        <p className="text-center text-gray-600">
          Gradient Extraction App © {new Date().getFullYear()}
        </p>
        <p className="text-center text-gray-500 text-sm mt-1">
          Automatically extract beautiful gradients from sunset and sunrise photos
        </p>
      </div>
    </footer>
  )
}

export default Footer 