import React, { useState, useEffect, useCallback } from 'react'
import { GradientDisplayProps, Gradient, ColorPalette } from '../types'
import { generateGradients } from '../utils/gradientGenerator'
import { extractColors } from '../utils/simpleColorExtractor'

// A4 dimensions in pixels at 300 DPI
const A4_WIDTH_PX = 2480; // 210mm at 300dpi
const A4_HEIGHT_PX = 3508; // 297mm at 300dpi

// A4 aspect ratio for preview
const A4_ASPECT_RATIO = A4_HEIGHT_PX / A4_WIDTH_PX; // ~1.414

// Updated props interface to match App.tsx
interface UpdatedGradientDisplayProps {
  palette: ColorPalette;
  uploadedImage: string;
  onSelectGradient: (gradient: Gradient) => void;
}

const GradientDisplay: React.FC<UpdatedGradientDisplayProps> = ({ 
  palette, 
  uploadedImage, 
  onSelectGradient 
}) => {
  const [gradients, setGradients] = useState<Gradient[]>([])
  const [selectedGradient, setSelectedGradient] = useState<Gradient | null>(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCSS, setShowCSS] = useState(false)
  const [colorCount, setColorCount] = useState<number>(palette.colors.length || 7)
  const [updatedPalette, setUpdatedPalette] = useState<ColorPalette>(palette)
  
  // Initialize palette with the provided palette
  useEffect(() => {
    setUpdatedPalette(palette);
  }, [palette]); // Only run when the initial palette prop changes
  
  // Extract colors from the provided image URL with new color count
  const extractColorsFromImage = useCallback(async (colorCount: number) => {
    setIsLoading(true);
    
    try {
      // Extract colors from the image using our simplified extractor
      const newPalette = await extractColors(uploadedImage, colorCount);
      setUpdatedPalette(newPalette);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage]); // Only depends on uploadedImage, not colorCount
  
  // Update colors when color count changes
  useEffect(() => {
    // Skip the initial render
    const handler = setTimeout(() => {
      extractColorsFromImage(colorCount);
    }, 100);
    
    return () => clearTimeout(handler);
  }, [colorCount]); // Don't include extractColorsFromImage in dependencies
  
  // Generate gradients when updatedPalette changes
  useEffect(() => {
    if (!updatedPalette) return;
    
    const generatedGradients = generateGradients(updatedPalette);
    setGradients(generatedGradients);
    
    // Only set selected gradient if none is currently selected
    if (!selectedGradient && generatedGradients.length > 0) {
      const firstGradient = generatedGradients[0];
      setSelectedGradient(firstGradient);
      
      // Notify parent component about the initially selected gradient
      if (onSelectGradient) {
        onSelectGradient(firstGradient);
      }
    }
  }, [updatedPalette, selectedGradient]); // Don't include onSelectGradient
  
  const handleGradientSelect = (gradient: Gradient) => {
    console.log('Gradient selected:', gradient.id, gradient.direction);
    setSelectedGradient(gradient);
    
    // Notify parent component
    onSelectGradient(gradient);
  };
  
  const copyToClipboard = (css: string) => {
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  
  // Generate an A4 gradient image
  const generateA4Gradient = (gradient: Gradient, colors: string[]): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        alert('Unable to create canvas context');
        return;
      }
      
      // Set A4 dimensions for high-quality print
      canvas.width = A4_WIDTH_PX;
      canvas.height = A4_HEIGHT_PX;
      
      // Create the appropriate gradient based on type
      let gradientFill;
      
      if (gradient.type === 'linear') {
        // Parse direction and create appropriate linear gradient
        if (gradient.direction.includes('right')) {
          // Horizontal gradient - left to right (sunset/sunrise effect)
          gradientFill = ctx.createLinearGradient(0, 0, canvas.width, 0);
        } else if (gradient.direction.includes('left')) {
          // Horizontal gradient - right to left (sunset/sunrise effect)
          gradientFill = ctx.createLinearGradient(canvas.width, 0, 0, 0);
        } else if (gradient.direction.includes('bottom slight right')) {
          // Slightly angled to the right
          gradientFill = ctx.createLinearGradient(canvas.width * 0.1, 0, canvas.width * 0.9, canvas.height);
        } else if (gradient.direction.includes('bottom slight left')) {
          // Slightly angled to the left
          gradientFill = ctx.createLinearGradient(canvas.width * 0.9, 0, canvas.width * 0.1, canvas.height);
        } else if (gradient.direction.includes('bottom right')) {
          gradientFill = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        } else if (gradient.direction.includes('bottom left')) {
          gradientFill = ctx.createLinearGradient(canvas.width, 0, 0, canvas.height);
        } else {
          // Default to top-to-bottom (includes all 'to bottom' variants)
          gradientFill = ctx.createLinearGradient(0, 0, 0, canvas.height);
        }
      } else {
        // Default fallback
        gradientFill = ctx.createLinearGradient(0, 0, 0, canvas.height);
      }
      
      // Handle the color stops based on the gradient style
      if (gradient.direction.includes('(soft)')) {
        // Softer transition with more emphasis on middle colors
        colors.forEach((color, index) => {
          const position = index === 0 ? 0 : 
                          index === colors.length - 1 ? 1 : 
                          ((index / (colors.length - 1)) * 0.6) + 0.2;
          gradientFill.addColorStop(position, color);
        });
      } else if (gradient.direction.includes('(emphasized)')) {
        // Emphasize the first color more
        colors.forEach((color, index) => {
          const position = index === 0 ? 0 : 
                          index === colors.length - 1 ? 1 : 
                          ((index / (colors.length - 1)) * 0.7) + 0.3;
          gradientFill.addColorStop(position, color);
        });
      } else if (gradient.direction.includes('(balanced)')) {
        // More balanced distribution with distinct bands
        colors.forEach((color, index) => {
          if (index === colors.length - 1) {
            gradientFill.addColorStop(index / colors.length, color);
          } else {
            gradientFill.addColorStop(index / colors.length, color);
            gradientFill.addColorStop((index + 1) / colors.length - 0.001, color);
          }
        });
      } else {
        // Standard even distribution
        colors.forEach((color, index) => {
          gradientFill.addColorStop(index / (colors.length - 1), color);
        });
      }
      
      // Fill canvas with gradient
      ctx.fillStyle = gradientFill;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle border for visual definition
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Return as data URL
      resolve(canvas.toDataURL('image/png'));
    });
  };
  
  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const downloadGradient = async () => {
    if (!selectedGradient || !updatedPalette) return;
    
    try {
      // Show loading state
      setIsLoading(true);
      
      // Generate the A4 format gradient
      const dataUrl = await generateA4Gradient(selectedGradient, updatedPalette.colors);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `gradient-${selectedGradient.type}-${selectedGradient.direction.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating gradient:', error);
      alert('Failed to generate gradient. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get an appropriate label for the gradient
  const getGradientLabel = (gradient: Gradient): string => {
    if (gradient.direction.includes('to bottom (')) {
      // Extract the style from the parentheses
      const match = gradient.direction.match(/\(([^)]+)\)/);
      return match ? `Vertical - ${match[1]}` : 'Vertical';
    } else if (gradient.direction.includes('to bottom slight')) {
      return gradient.direction.includes('right') ? 'Vertical - slight right' : 'Vertical - slight left';
    } else if (gradient.direction === 'to bottom') {
      return 'Vertical - standard';
    } else if (gradient.direction.includes('right') || gradient.direction.includes('left')) {
      return 'Sunset/Sunrise View';
    }
    return '';
  };
  
  // Helper function to determine the CSS class for a gradient thumbnail
  const getGradientThumbnailClass = (gradient: Gradient): string => {
    let baseClass = 'gradient-thumbnail rounded-md w-full h-24 shadow-sm transition-all hover:shadow-md cursor-pointer z-10 relative';
    
    if (selectedGradient?.id === gradient.id) {
      baseClass += ' ring-2 ring-blue-500 scale-105';
    }
    
    if (gradient.direction === 'to bottom') {
      return `${baseClass} vertical`;
    } else if (gradient.direction.includes('to bottom (soft)')) {
      return `${baseClass} vertical-soft`;
    } else if (gradient.direction.includes('to bottom (emphasized)')) {
      return `${baseClass} vertical-emphasized`;
    } else if (gradient.direction.includes('to bottom (balanced)')) {
      return `${baseClass} vertical-balanced`;
    } else if (gradient.direction.includes('to bottom')) {
      return `${baseClass} vertical`;
    } else if (gradient.direction === 'to right' || gradient.direction === 'to left') {
      return `${baseClass} horizontal`;
    } else {
      return baseClass;
    }
  };
  
  const handleCopyCSS = () => {
    if (!selectedGradient) return;
    copyToClipboard(`background-image: ${selectedGradient.css};`);
  };
  
  if (!gradients.length) return null;
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left column - Image preview and color palette */}
        <div className="order-2 md:order-1">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-lg font-medium mb-4 text-gray-800">Original Image</h3>
            <div className="rounded-lg overflow-hidden shadow-inner max-h-[300px]">
              <img 
                src={uploadedImage} 
                alt="Uploaded sunset" 
                className="w-full object-cover" 
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-lg font-medium mb-4 text-gray-800">Color Palette</h3>
            <div className="flex flex-wrap gap-2">
              {updatedPalette.colors.map((color, index) => (
                <div 
                  key={index} 
                  className="w-10 h-10 rounded-md shadow-sm" 
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          {/* Color count slider - replacing the yellow box in the sketch */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-lg font-medium mb-4 text-gray-800">Color Extraction Settings</h3>
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
              <p className="mt-2 text-xs text-gray-500 italic">
                Adjusting the slider will regenerate the color palette and gradients.
              </p>
            </div>
          </div>
        </div>
        
        {/* Middle column - Main gradient display */}
        <div className="order-1 md:order-2 md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-800">Generated Gradient</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={handleCopyCSS}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  {copied ? 'Copied!' : 'Copy CSS'}
                </button>
                <button 
                  onClick={downloadGradient}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  {isLoading ? 'Generating...' : 'Download'}
                </button>
              </div>
            </div>
            
            <div className="aspect-[3/4] w-full rounded-lg shadow-lg overflow-hidden mb-4">
              {selectedGradient ? (
                <div 
                  className="w-full h-full"
                  style={{ background: selectedGradient.css }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">Select a gradient to preview</p>
                </div>
              )}
            </div>
            
            {selectedGradient && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700 font-medium mb-1">Type: {getGradientLabel(selectedGradient)}</p>
                <p className="text-xs text-gray-500 font-mono overflow-x-auto whitespace-nowrap">{selectedGradient.css}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Gradient variations moved to the right of the main display */}
        <div className="order-3 md:order-3">
          <div className="bg-white rounded-lg shadow-md p-4 h-full">
            <h3 className="text-lg font-medium mb-4 text-gray-800">Gradient Variations</h3>
            <div className="grid grid-cols-1 gap-4">
              {gradients.map((gradient) => (
                <div 
                  key={gradient.id} 
                  className="flex flex-col items-center hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                  onClick={() => {
                    console.log('Parent div clicked for gradient:', gradient.id);
                    handleGradientSelect(gradient);
                  }}
                >
                  <div
                    style={{ background: gradient.css }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click from bubbling to parent div
                      console.log('Div clicked for gradient:', gradient.id);
                      handleGradientSelect(gradient);
                    }}
                    title={`${gradient.type} gradient - ${gradient.direction}`}
                    className={getGradientThumbnailClass(gradient)}
                  ></div>
                  <span className="text-xs mt-1 text-gray-500 truncate w-full text-center">
                    {getGradientLabel(gradient) || gradient.direction}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GradientDisplay 