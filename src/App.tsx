import { useState, useEffect } from 'react'
import ImageUploader from './components/ImageUploader'
import GradientDisplay from './components/GradientDisplay'
import Header from './components/Header'
import Footer from './components/Footer'
import { ColorPalette } from './types'

function App() {
  console.log('App component rendering')
  
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('App component mounted')
    // Check if all imported components are available
    console.log('Components available:', {
      ImageUploader: !!ImageUploader,
      GradientDisplay: !!GradientDisplay,
      Header: !!Header,
      Footer: !!Footer
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold p-4 text-center">Gradient Extraction App</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Only render the more complex components if we haven't seen errors */}
      {!error && (
        <>
          <Header />
          
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Upload a Sunset or Sunrise Photo</h2>
                
                <ImageUploader 
                  onImageUpload={setImageUrl} 
                  onPaletteExtracted={setColorPalette}
                  setIsLoading={setIsLoading}
                />
              </div>
              
              {isLoading && (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Extracting colors...</p>
                </div>
              )}
              
              {!isLoading && imageUrl && colorPalette && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Original image - smaller column */}
                    <div className="md:col-span-4">
                      <h3 className="text-lg font-semibold mb-4">Original Image</h3>
                      <div className="flex flex-col space-y-4">
                        <img 
                          src={imageUrl} 
                          alt="Uploaded sunset/sunrise" 
                          className="w-full h-auto rounded-lg shadow-sm object-contain max-h-60"
                        />
                        
                        <div className="flex flex-wrap gap-2 justify-center">
                          {colorPalette.colors.map((color, i) => (
                            <div 
                              key={i} 
                              className="w-8 h-8 rounded-md shadow-sm cursor-pointer hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Generated gradients - larger column */}
                    <div className="md:col-span-8">
                      <h3 className="text-xl font-semibold mb-4">Generated Gradients</h3>
                      <GradientDisplay palette={colorPalette} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
          
          <Footer />
        </>
      )}
    </div>
  )
}

export default App 