import { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { Gradient, ColorPalette } from './types'
import ImageUploader from './components/ImageUploader'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorDisplay from './components/ErrorDisplay'
import { Toaster } from "@/components/ui/sonner"

// Lazy load non-critical components
const GradientDisplay = lazy(() => import('./components/GradientDisplay'))
const FloatingGradientLanding = lazy(() => import('./components/FloatingGradientLanding'))

// Preload GradientDisplay when ImageUploader is visible
const preloadGradientDisplay = () => {
  const component = import('./components/GradientDisplay')
  return component
}

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLanding, setShowLanding] = useState(true)

  // Preload GradientDisplay component when needed
  useEffect(() => {
    if (!showLanding) {
      preloadGradientDisplay()
    }
  }, [showLanding])

  const handleResetImage = useCallback(() => {
    setImageUrl(null)
    setColorPalette(null)
    setShowLanding(false)
  }, [])

  const handleGradientSelect = useCallback((gradient: Gradient) => {
    // Handle gradient selection if needed
    console.log('Selected gradient:', gradient)
  }, [])

  // Error handling
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.message)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (error) {
    return <ErrorDisplay message={error} onRetry={() => setError(null)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Toaster />
      {isLoading && <LoadingSpinner />}
      
      {showLanding ? (
        <Suspense fallback={<LoadingSpinner />}>
          <FloatingGradientLanding onGetStarted={() => setShowLanding(false)} />
        </Suspense>
      ) : imageUrl && colorPalette ? (
        <Suspense fallback={<LoadingSpinner />}>
          <GradientDisplay
            uploadedImage={imageUrl}
            palette={colorPalette}
            onSelectGradient={handleGradientSelect}
            onResetImage={handleResetImage}
          />
        </Suspense>
      ) : (
        <ImageUploader 
          setImageUrl={setImageUrl}
          setColorPalette={setColorPalette}
          setIsLoading={setIsLoading}
          setError={setError}
          setUploadedImage={setImageUrl}
        />
      )}
    </div>
  )
}

export default App 