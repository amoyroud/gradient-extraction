import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy, memo } from 'react'
import ImageUploader from './components/ImageUploader'
import { ColorPalette, Gradient } from './types'
import LoadingSpinner from './components/LoadingSpinner'
import PremiumLanding from './components/PremiumLanding'

// Lazy load non-critical components
const GradientDisplay = lazy(() => import('./components/GradientDisplay'))
const FloatingGradientLanding = lazy(() => import('./components/FloatingGradientLanding'))

// Loading fallback for lazy-loaded components
const LazyLoadingFallback = () => (
  <div className="flex items-center justify-center p-4 min-h-[200px]">
    <div className="animate-pulse flex space-x-2">
      <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
      <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
      <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
    </div>
  </div>
);

// Memoize the entire App component to prevent unnecessary re-renders
const App = memo(() => {
  // Remove logging in production
  // console.log('App component rendering')
  
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

  // Performance optimization: Preload GradientDisplay component when image upload starts
  useEffect(() => {
    if (isLoading && !uploadedImage) {
      // Preload the GradientDisplay component that will be needed soon
      const preloadGradientDisplay = () => {
        // Just importing triggers the preload
        import('./components/GradientDisplay');
      };
      preloadGradientDisplay();
    }
  }, [isLoading, uploadedImage]);

  useEffect(() => {
    // Remove logging in production
    // console.log('App component mounted')
    
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
  
  const goToHome = useCallback(() => {
    window.location.hash = '';
  }, []);

  const copyGradientCSS = useCallback(() => {
    if (!selectedGradient) return;
    
    const css = `background-image: ${selectedGradient.css};`;
    
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [selectedGradient]);
  
  const handleGetStarted = useCallback(() => {
    setShowLanding(false);
    setShowUploader(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Wrap handleSelectGradient in useCallback to prevent it from changing on each render
  const handleSelectGradient = useCallback((gradient: Gradient) => {
    // Only log in development environment to avoid performance impact
    if (process.env.NODE_ENV !== 'production') {
      console.log('Gradient selected in App:', gradient.id);
    }
    
    // Only update if the gradient has changed to prevent unnecessary re-renders
    setSelectedGradient(prevGradient => {
      if (prevGradient?.id !== gradient.id) {
        return gradient;
      }
      return prevGradient;
    });
  }, []); // Empty dependency array means this function won't change

  const handleImageUpload = useCallback((file: File) => {
    setUploadedImage(URL.createObjectURL(file));
  }, []);

  // Handler to reset the uploaded image
  const handleResetImage = useCallback(() => {
    setUploadedImage(null);
    setImageUrl(null);
    setPalette(null);
    setSelectedGradient(null);
    setShowLanding(false);
    setShowUploader(true);
  }, []);

  // Memoize the error display component to prevent re-renders
  const errorDisplay = useMemo(() => {
    if (!error) return null;
    
    return (
      <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
        <p>{error}</p>
        <button 
          className="mt-2 text-sm text-red-800 underline"
          onClick={() => setError(null)}
        >
          Dismiss
        </button>
      </div>
    );
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col">
        {errorDisplay}

        {!uploadedImage ? (
          <>
            {showLanding ? (
              <Suspense fallback={<LazyLoadingFallback />}>
                <FloatingGradientLanding onGetStarted={handleGetStarted} />
              </Suspense>
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
              <Suspense fallback={<LazyLoadingFallback />}>
                <GradientDisplay 
                  palette={palette} 
                  uploadedImage={uploadedImage}
                  onSelectGradient={handleSelectGradient}
                  onResetImage={handleResetImage}
                />
              </Suspense>
            )}
          </>
        )}
      </div>
    </div>
  )
});

export default App 