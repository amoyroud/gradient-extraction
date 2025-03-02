import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { extractColors } from '../utils/simpleColorExtractor'
import { ColorPalette } from '../types'

// Updated props interface to match what App.tsx is passing
interface UpdatedImageUploaderProps {
  setImageUrl: (url: string | null) => void;
  setColorPalette: (palette: ColorPalette | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setUploadedImage: (url: string | null) => void;
}

const ImageUploader: React.FC<UpdatedImageUploaderProps> = ({ 
  setImageUrl,
  setColorPalette,
  setIsLoading,
  setError,
  setUploadedImage
}) => {
  const [colorCount, setColorCount] = useState<number>(7);
  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);
  
  // This effect will re-extract colors when colorCount changes if we have a cached image
  useEffect(() => {
    if (cachedImageUrl) {
      extractColorsFromImage(cachedImageUrl);
    }
  }, [colorCount]);
  
  // Extract colors from the provided image URL
  const extractColorsFromImage = useCallback(async (imageUrl: string) => {
    setIsLoading(true);
    
    try {
      // Extract colors from the image using our simplified extractor
      const palette = await extractColors(imageUrl, colorCount);
      setColorPalette(palette);
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Error processing image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setColorPalette, setIsLoading, setError, colorCount]);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.match('image.*')) {
      setError('Please upload an image file');
      return;
    }
    
    // Reset palette
    setColorPalette(null);
    
    // Create a URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    // Update UI with the new image
    setImageUrl(imageUrl);
    setUploadedImage(imageUrl);
    
    // Cache the image URL for later re-processing
    setCachedImageUrl(imageUrl);
    
    // Extract colors from the image
    await extractColorsFromImage(imageUrl);
    
  }, [setImageUrl, setColorPalette, setUploadedImage, extractColorsFromImage, setError]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });
  
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 flex flex-col">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors flex-grow min-h-[300px] flex flex-col items-center justify-center
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:shadow-md'}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-5">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 text-gray-400" 
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
            <p className="text-blue-500 font-medium text-lg">Drop the image here...</p>
          ) : (
            <>
              <p className="text-gray-600 font-medium text-lg">
                Drag & drop a sunset or sunrise image here,<br /> or click to select a file
              </p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG and WebP images
              </p>
            </>
          )}
        </div>
      </div>
      
      {/* Only show color count settings after an image has been uploaded */}
      {cachedImageUrl && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm mx-auto w-full">
          <h3 className="font-medium text-gray-700 mb-3">Color Extraction Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="colorCount" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Colors: {colorCount}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs">2</span>
                <input
                  type="range"
                  id="colorCount"
                  min="2"
                  max="12"
                  value={colorCount}
                  onChange={(e) => setColorCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs">12</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="italic">
              Adjusting the number of colors will automatically update the palette without requiring re-upload.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader 