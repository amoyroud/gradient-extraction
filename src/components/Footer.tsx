import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-black bg-opacity-30 backdrop-filter backdrop-blur-lg border-t border-white border-opacity-10 py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="text-center md:text-left text-gray-400">
              Sunset Memories © {new Date().getFullYear()}
            </p>
            <p className="text-center md:text-left text-gray-500 text-sm mt-1">
              Preserve your most beautiful moments in timeless gradients
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-4">
            <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              About Us
            </span>
            <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              Contact
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 