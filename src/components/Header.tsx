import React from 'react'

const Header: React.FC = () => {
  return (
    <header className="bg-black bg-opacity-30 backdrop-filter backdrop-blur-lg text-white py-6 shadow-lg border-b border-white border-opacity-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center shadow-lg mr-3">
              <div className="text-white text-lg font-bold">S</div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
                Sunset Memories
              </span>
            </h1>
          </div>
          
          <div className="hidden md:flex space-x-4">
            <span className="text-gray-300">Transform Your Moments</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 