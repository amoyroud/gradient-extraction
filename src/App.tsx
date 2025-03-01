import React, { useState, useEffect, useCallback } from 'react'
import ImageUploader from './components/ImageUploader'
import GradientDisplay from './components/GradientDisplay'
import LoadingSpinner from './components/LoadingSpinner'
import Footer from './components/Footer'
import { ColorPalette, Gradient } from './types'
import PremiumLanding from './components/PremiumLanding'

const App = () => {
  console.log('App component rendering')
  
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showPhysicalItems, setShowPhysicalItems] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const [selectedGradient, setSelectedGradient] = useState<Gradient | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [palette, setPalette] = useState<ColorPalette | null>(null)
  const [showUploader, setShowUploader] = useState<boolean>(false)

  useEffect(() => {
    console.log('App component mounted')
    // Check if all imported components are available
    console.log('Components available:', {
      ImageUploader: !!ImageUploader,
      GradientDisplay: !!GradientDisplay,
      Footer: !!Footer
    })

    // Check for errors during initialization
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error)
      setError('An unexpected error occurred. Please try again.')
    }
    
    window.addEventListener('error', handleError)
    
    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [])
  
  const goToHome = () => {
    window.location.hash = '';
  };

  const copyGradientCSS = () => {
    if (!selectedGradient) return;
    
    const css = `background-image: ${selectedGradient.css};`;
    
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleGetStarted = () => {
    setShowUploader(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Wrap handleSelectGradient in useCallback to prevent it from changing on each render
  const handleSelectGradient = useCallback((gradient: Gradient) => {
    console.log('Gradient selected in App:', gradient.id);
    setSelectedGradient(gradient);
  }, []); // Empty dependency array means this function won't change

  const handleImageUpload = (file: File) => {
    setUploadedImage(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            <p>{error}</p>
            <button 
              className="mt-2 text-sm text-red-800 underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {!uploadedImage ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-light mb-4 tracking-tight text-gray-900">
                Discover Your Perfect Sunset Palette
              </h1>
              <p className="text-lg text-gray-600">
                Upload a sunset photo to generate beautiful color palettes and gradients for your design projects
              </p>
            </div>
            
            <ImageUploader 
              setImageUrl={setImageUrl}
              setUploadedImage={setUploadedImage} 
              setColorPalette={setPalette}
              setError={setError}
              setIsLoading={setIsLoading}
            />
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <LoadingSpinner />
              </div>
            ) : null}
            
            {palette && uploadedImage && (
              <GradientDisplay 
                palette={palette} 
                uploadedImage={uploadedImage}
                onSelectGradient={handleSelectGradient} 
              />
            )}
            
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setImageUrl(null);
                  setPalette(null);
                  setSelectedGradient(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Upload a different image
              </button>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default App 