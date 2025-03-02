import React, { useState, useEffect, useCallback } from 'react'
import ImageUploader from './components/ImageUploader'
import GradientDisplay from './components/GradientDisplay'
import LoadingSpinner from './components/LoadingSpinner'
import { ColorPalette, Gradient } from './types'
import PremiumLanding from './components/PremiumLanding'
import FloatingGradientLanding from './components/FloatingGradientLanding'

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
  const [showLanding, setShowLanding] = useState<boolean>(true)

  useEffect(() => {
    console.log('App component mounted')
    // Check if all imported components are available
    console.log('Components available:', {
      ImageUploader: !!ImageUploader,
      GradientDisplay: !!GradientDisplay
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
    setShowLanding(false);
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

  // Handler to reset the uploaded image
  const handleResetImage = useCallback(() => {
    setUploadedImage(null);
    setImageUrl(null);
    setPalette(null);
    setSelectedGradient(null);
    setShowLanding(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col">
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
          <>
            {showLanding ? (
              <FloatingGradientLanding onGetStarted={handleGetStarted} />
            ) : (
              <div className="max-w-3xl mx-auto my-auto flex-grow flex flex-col justify-center">
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
            )}
          </>
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
                onResetImage={handleResetImage}
              />
            )}
          </>
        )}
      </div>
      
      {/* Footer has been removed */}
    </div>
  )
}

export default App 