import React from 'react'

const MinimalApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Gradient Extraction App</h1>
        <p className="text-gray-600 text-center mb-4">
          This is a minimal version of the app to verify that React is rendering correctly.
        </p>
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-32 rounded-lg mb-4"></div>
        <button 
          onClick={() => alert('React is working!')}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors"
        >
          Click Me
        </button>
      </div>
    </div>
  )
}

export default MinimalApp 