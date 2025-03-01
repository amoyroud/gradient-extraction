import React from 'react'

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white py-6 shadow-md">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          Gradient Extraction App
        </h1>
        <p className="text-center mt-2 max-w-2xl mx-auto text-white/90">
          Upload your favorite sunset or sunrise photos and extract beautiful gradients
        </p>
      </div>
    </header>
  )
}

export default Header 