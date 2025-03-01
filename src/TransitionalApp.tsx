import React, { useState, useCallback } from 'react'
import { ColorPalette } from './types'

// Import components one by one to test which one might be causing issues
const Header = () => (
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

const Footer = () => (
  <footer className="bg-gray-100 py-6 mt-12">
    <div className="container mx-auto px-4">
      <p className="text-center text-gray-600">
        Gradient Extraction App © {new Date().getFullYear()}
      </p>
    </div>
  </footer>
)

// A functional image uploader that doesn't depend on color-thief-ts
const WorkingImageUploader = ({ onImageSelected }: { onImageSelected: (imageUrl: string) => void }) => {
  const [isDragActive, setIsDragActive] = useState(false)
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }, [])
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.match('image.*')) {
        const imageUrl = URL.createObjectURL(file)
        onImageSelected(imageUrl)
      } else {
        alert('Please upload an image file')
      }
    }
  }, [onImageSelected])
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.match('image.*')) {
        const imageUrl = URL.createObjectURL(file)
        onImageSelected(imageUrl)
      } else {
        alert('Please upload an image file')
      }
    }
  }, [onImageSelected])
  
  return (
    <div className="w-full">
      <div 
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input 
          id="fileInput" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          
          {isDragActive ? (
            <p className="text-blue-500 font-medium">Drop the image here...</p>
          ) : (
            <>
              <p className="text-gray-600 font-medium">
                Drag & drop a sunset or sunrise image here,<br /> or click to select a file
              </p>
              <p className="text-xs text-gray-500">
                Supports JPG, PNG and WebP images
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Basic gradient display without using the complex GradientDisplay component
const BasicGradientDisplay = ({ imageUrl }: { imageUrl: string }) => {
  // Generate mock gradients without using color-thief-ts
  const mockGradients = [
    { id: '1', css: 'linear-gradient(to right, #ff7e5f, #feb47b)' },
    { id: '2', css: 'linear-gradient(to bottom, #ff7e5f, #feb47b)' },
    { id: '3', css: 'radial-gradient(circle at center, #ff7e5f, #feb47b)' },
  ]
  
  const [selectedGradient, setSelectedGradient] = useState(mockGradients[0])
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Original Image</h3>
        <img 
          src={imageUrl} 
          alt="Uploaded sunset/sunrise" 
          className="max-w-full h-auto max-h-96 rounded-lg shadow-sm"
        />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Generated Gradients</h3>
        <div className="space-y-6">
          <div 
            className="w-full h-64 rounded-lg shadow-md"
            style={{ backgroundImage: selectedGradient.css }}
          />
          
          <div className="flex flex-wrap gap-3 mb-4">
            {mockGradients.map((gradient) => (
              <button
                key={gradient.id}
                className={`w-12 h-12 rounded-md shadow-sm transition-all hover:shadow-md
                  ${selectedGradient.id === gradient.id ? 'ring-2 ring-blue-500 scale-105' : ''}`}
                style={{ backgroundImage: gradient.css }}
                onClick={() => setSelectedGradient(gradient)}
              />
            ))}
          </div>
          
          <div className="bg-gray-100 rounded-md p-4">
            <pre className="bg-gray-800 text-gray-100 p-3 rounded text-sm overflow-x-auto">
              {`background-image: ${selectedGradient.css};`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

const TransitionalApp: React.FC = () => {
  // Use local state to track which step we're testing
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  // Render different levels of complexity based on the step
  const renderContent = () => {
    try {
      switch (step) {
        case 1:
          return (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Step 1: Basic Layout</h2>
                <p className="text-center mb-4">This confirms the basic layout works.</p>
                <button 
                  onClick={() => setStep(2)} 
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md"
                >
                  Continue to Step 2
                </button>
              </div>
            </div>
          )
        
        case 2:
          return (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Step 2: With Header & Footer</h2>
                <p className="text-center mb-4">Testing with simple Header and Footer components.</p>
                <button 
                  onClick={() => setStep(3)} 
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md"
                >
                  Continue to Step 3
                </button>
              </div>
            </div>
          )
        
        case 3:
          return (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Step 3: With Working Image Upload</h2>
                {!uploadedImageUrl ? (
                  <WorkingImageUploader onImageSelected={setUploadedImageUrl} />
                ) : (
                  <>
                    <BasicGradientDisplay imageUrl={uploadedImageUrl} />
                    <button 
                      onClick={() => setUploadedImageUrl(null)} 
                      className="mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Upload Another Image
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => setStep(4)} 
                  className="w-full mt-6 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md"
                  disabled={!uploadedImageUrl}
                >
                  Continue to Step 4
                </button>
              </div>
            </div>
          )
        
        case 4:
          // This would be where we start importing actual components
          // For now, just show a success message
          return (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Success!</h2>
                <p className="text-center mb-4">
                  All transitional steps are working correctly. Now we can identify which real component is causing issues.
                </p>
                <p className="text-center mb-4">
                  The problem is likely related to the color-thief-ts library or one of the import/export issues.
                </p>
                {uploadedImageUrl && (
                  <div className="mb-6">
                    <p className="font-medium mb-2">Your uploaded image:</p>
                    <img 
                      src={uploadedImageUrl}
                      alt="Uploaded image" 
                      className="max-w-full h-auto max-h-64 rounded-lg mx-auto"
                    />
                  </div>
                )}
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md"
                >
                  Reload Page
                </button>
              </div>
            </div>
          )
          
        default:
          return <div>Unknown step</div>
      }
    } catch (err) {
      console.error('Error in step', step, err)
      setError(`Error in step ${step}: ${err instanceof Error ? err.message : String(err)}`)
      return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
          <p className="font-bold">Error Detected:</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Reload
          </button>
        </div>
      ) : (
        <>
          {step >= 2 ? <Header /> : <h1 className="text-3xl font-bold p-4 text-center">Gradient Extraction App</h1>}
          
          <main className="flex-grow container mx-auto px-4 py-8">
            {renderContent()}
          </main>
          
          {step >= 2 && <Footer />}
        </>
      )}
    </div>
  )
}

export default TransitionalApp 