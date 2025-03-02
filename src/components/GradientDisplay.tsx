import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { GradientDisplayProps, Gradient, ColorPalette, GradientCustomizationSettings } from '../types'
import { generateGradients } from '../utils/gradientGenerator'
import { extractColors } from '../utils/simpleColorExtractor'
import GradientCustomizer from './GradientCustomizer'
import ColorPositionAdjuster from './ColorPositionAdjuster'

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
  onResetImage?: () => void; // Add a callback for resetting the image
}

// Add a debounce utility at the top of the file
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, waitFor);
  };
};

// Use React.memo to prevent unnecessary re-renders of the entire component
const GradientDisplay: React.FC<UpdatedGradientDisplayProps> = React.memo(({ 
  palette, 
  uploadedImage, 
  onSelectGradient,
  onResetImage 
}) => {
  const [gradients, setGradients] = useState<Gradient[]>([])
  const [selectedGradient, setSelectedGradient] = useState<Gradient | null>(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // Add a stable loading state that doesn't flicker
  const [stableLoading, setStableLoading] = useState(false)
  const [isLoadingVariations, setIsLoadingVariations] = useState(false)
  const [stableLoadingVariations, setStableLoadingVariations] = useState(false)
  const [showCSS, setShowCSS] = useState(false)
  const [colorCount, setColorCount] = useState<number>(palette.colors.length || 7)
  const [updatedPalette, setUpdatedPalette] = useState<ColorPalette>(palette)
  const [mainGradientUpdated, setMainGradientUpdated] = useState(false)
  // Add state for variations panel visibility
  const [showVariations, setShowVariations] = useState(false)
  // Add state to store color count variations
  const [colorCountVariations, setColorCountVariations] = useState<{count: number, palette: ColorPalette}[]>([])
  // Keep blend hardness setting in state but don't show UI controls for it
  const [customizationSettings, setCustomizationSettings] = useState<GradientCustomizationSettings>({
    blendHardness: 50, // Default value (middle blend hardness)
  })
  
  // Debounced version of setIsLoading to prevent rapid toggling
  const setDebouncedLoading = useCallback(
    debounce((value: boolean) => {
      if (value === true) {
        // Immediately set to loading
        setStableLoading(true);
      } else {
        // Delay turning off loading state to prevent flickering
        setTimeout(() => {
          setStableLoading(false);
        }, 300);
      }
    }, 50),
    []
  );

  // Debounced version of setIsLoadingVariations
  const setDebouncedLoadingVariations = useCallback(
    debounce((value: boolean) => {
      if (value === true) {
        // Immediately set to loading
        setStableLoadingVariations(true);
      } else {
        // Delay turning off loading state to prevent flickering
        setTimeout(() => {
          setStableLoadingVariations(false);
        }, 300);
      }
    }, 50),
    []
  );

  // Watch for changes in isLoading and update stableLoading
  useEffect(() => {
    setDebouncedLoading(isLoading);
  }, [isLoading, setDebouncedLoading]);
  
  // Watch for changes in isLoadingVariations and update stableLoadingVariations
  useEffect(() => {
    setDebouncedLoadingVariations(isLoadingVariations);
  }, [isLoadingVariations, setDebouncedLoadingVariations]);
  
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
      // Set flag to indicate main gradient should be updated
      setMainGradientUpdated(false);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage]); // Only depends on uploadedImage, not colorCount
  
  // Preload color count variations in the background whenever an image is uploaded
  useEffect(() => {
    if (!uploadedImage) return;
    
    // Only generate variations if we don't have them already
    if (colorCountVariations.length === 0) {
      // Use a small delay to prioritize loading the main gradient first
      const timer = setTimeout(() => {
        const generateVariations = async () => {
          setIsLoadingVariations(true);
          const variations: {count: number, palette: ColorPalette}[] = [];
          
          // Generate palettes for color counts 4 through 12
          for (let count = 4; count <= 12; count++) {
            try {
              const extractedPalette = await extractColors(uploadedImage, count);
              variations.push({ count, palette: extractedPalette });
            } catch (error) {
              console.error(`Error generating palette with ${count} colors:`, error);
            }
          }
          
          setColorCountVariations(variations);
          setIsLoadingVariations(false);
        };
        
        generateVariations();
      }, 500); // 500ms delay to let main UI render first
      
      return () => clearTimeout(timer);
    }
  }, [uploadedImage, colorCountVariations.length]);
  
  // Reset variations when image changes
  useEffect(() => {
    // Clear existing variations when a new image is uploaded
    setColorCountVariations([]);
  }, [uploadedImage]);
  
  // Update colors when color count changes
  useEffect(() => {
    // Skip the initial render
    const handler = setTimeout(() => {
      extractColorsFromImage(colorCount);
    }, 100);
    
    return () => clearTimeout(handler);
  }, [colorCount]); // Don't include extractColorsFromImage in dependencies
  
  // Initialize gradients when palette changes or customization settings change
  useEffect(() => {
    const generateVariations = async () => {
      setIsLoading(true);
      try {
        // Generate new gradients based on the current palette and customization settings
        const newGradients = await generateGradients(updatedPalette, customizationSettings);
        
        // Only update if the gradients have actually changed
        setGradients(prevGradients => {
          // Simple check if the gradients are the same by comparing the first one's ID
          if (prevGradients.length > 0 && 
              newGradients.length > 0 && 
              prevGradients[0].id === newGradients[0].id) {
            return prevGradients;
          }
          return newGradients;
        });
        
        // Only update selected gradient if needed
        if (!selectedGradient || mainGradientUpdated) {
          setSelectedGradient(newGradients[0]);
          
          // Avoid unnecessary parent component updates
          // Only call onSelectGradient if we don't already have a selected gradient
          // or if we've explicitly requested a main gradient update
          if (!selectedGradient || mainGradientUpdated) {
            onSelectGradient(newGradients[0]);
          }
          
          // Reset the flag after handling
          if (mainGradientUpdated) {
            setMainGradientUpdated(false);
          }
        }
      } catch (error) {
        console.error("Error generating gradients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    generateVariations();
  }, [updatedPalette, customizationSettings, mainGradientUpdated, onSelectGradient, selectedGradient]);
  
  // Handle gradient selection
  const handleGradientSelect = useCallback((gradient: Gradient) => {
    // Prevent unnecessary state updates if we're already using this gradient
    if (selectedGradient?.id === gradient.id) {
      return;
    }
    
    setSelectedGradient(gradient);
    
    // Call the parent's callback
    onSelectGradient(gradient);
  }, [selectedGradient, onSelectGradient]);

  // Handler for customization settings changes
  const handleCustomizationChange = (newSettings: GradientCustomizationSettings) => {
    setCustomizationSettings(newSettings);
    setMainGradientUpdated(false); // Force gradient regeneration
  };
  
  // Handler for selecting a color count variation
  const handleSelectColorCountVariation = (count: number, newPalette: ColorPalette) => {
    setColorCount(count);
    setUpdatedPalette(newPalette);
    setMainGradientUpdated(false); // Force gradient regeneration
  };
  
  const copyToClipboard = (css: string) => {
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  
  // Add a new function to copy the color palette
  const handleCopyColorPalette = () => {
    if (!updatedPalette || !updatedPalette.colors.length) return;
    const colorValues = updatedPalette.colors.join(', ');
    copyToClipboard(colorValues);
  };
  
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
      
      // Extract color stops from gradient.css if available (which includes customizations)
      if (gradient.css.includes('linear-gradient')) {
        try {
          // Parse the CSS to get the color stops
          const cssMatch = gradient.css.match(/linear-gradient\([^,]+,\s*(.*)\)/);
          if (cssMatch && cssMatch[1]) {
            const colorStopsString = cssMatch[1];
            const colorStops = colorStopsString.split(',').map(stop => stop.trim());
            
            colorStops.forEach(stop => {
              const parts = stop.split(' ');
              const color = parts[0];
              let position = parts[1] ? parseFloat(parts[1]) / 100 : null;
              
              // If position is explicitly specified, use it
              if (position !== null) {
                gradientFill.addColorStop(position, color);
              }
              // Otherwise, don't add a stop for this color (it's probably a duplicate)
            });
          } else {
            // Fallback to standard color distribution
            colors.forEach((color, index) => {
              gradientFill.addColorStop(index / (colors.length - 1), color);
            });
          }
        } catch (error) {
          console.error('Error parsing gradient CSS:', error);
          // Fallback to standard color distribution
          colors.forEach((color, index) => {
            gradientFill.addColorStop(index / (colors.length - 1), color);
          });
        }
      } else {
        // Fallback to standard color distribution
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
  
  const handleResetImage = () => {
    if (onResetImage) {
      onResetImage();
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
    let baseClass = 'gradient-thumbnail rounded-md w-full h-20 shadow-sm transition-all hover:shadow-md cursor-pointer z-10 relative';
    
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
  
  const handleRefreshMainGradient = () => {
    if (selectedGradient) {
      // Re-apply the current selected gradient to ensure it updates
      handleGradientSelect(selectedGradient);
    }
  };
  
  // Function to create a linear gradient based on a direction and color palette
  const createGradientPreview = (direction: string, colorPalette: ColorPalette): string => {
    // Use only the direction part without additional qualifiers
    const baseDirection = direction.includes('(') 
      ? direction.substring(0, direction.indexOf('(') - 1) 
      : direction;
    
    // Create a simple CSS gradient
    return `linear-gradient(${baseDirection}, ${colorPalette.colors.join(', ')})`;
  };
  
  // Memoize the color count variation palettes to avoid recalculation
  const memoizedColorCountVariations = useMemo(() => {
    return colorCountVariations;
  }, [colorCountVariations]);

  // Memoize gradient rendering components to prevent unnecessary recalculations
  const renderGradientThumbnails = useMemo(() => {
    return gradients.map((gradient) => (
      <div
        key={gradient.id}
        className={`gradient-thumbnail ${getGradientThumbnailClass(gradient)} ${
          selectedGradient && selectedGradient.id === gradient.id ? 'border-2 border-blue-500' : ''
        }`}
        style={{ background: gradient.css }}
        onClick={() => handleGradientSelect(gradient)}
      >
        <div className="absolute bottom-0 left-0 right-0 gradient-label">
          {getGradientLabel(gradient)}
        </div>
      </div>
    ));
  }, [gradients, selectedGradient]);
  
  if (!gradients.length) return null;
  
  return (
    <div className="max-w-6xl mx-auto px-2 py-2 mt-0">
      <div className={`grid ${showVariations ? 'grid-cols-1 md:grid-cols-12' : 'grid-cols-1 md:grid-cols-9 max-w-4xl mx-auto'} gap-2 transition-all duration-300`}>
        {/* Left column - Image preview and color palette */}
        <div className={`order-2 md:order-1 ${showVariations ? 'md:col-span-3' : 'md:col-span-3'}`}>
          <div className="bg-white rounded-lg shadow-md p-2 mb-2">
            <h3 className="text-base font-medium mb-1 text-gray-800">Original Image</h3>
            <div className="rounded-lg overflow-hidden shadow-inner max-h-[130px]">
              <img 
                src={uploadedImage} 
                alt="Uploaded sunset" 
                className="w-full object-cover h-auto" 
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-2 mb-2">
            <h3 className="text-base font-medium mb-1 text-gray-800">Color Palette</h3>
            <div className="flex flex-wrap gap-1">
              {updatedPalette.colors.map((color, index) => (
                <div 
                  key={index} 
                  className="w-6 h-6 rounded-md shadow-sm" 
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              {/* Updated button to match Download and Upload styling */}
              <button
                onClick={handleCopyColorPalette}
                className="ml-1 px-2 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm"
                title="Copy Color Palette"
              >
                {copied ? "✓ Copied" : "Copy Colors"}
              </button>
            </div>
          </div>
          
          {/* Color count slider - replacing the yellow box in the sketch */}
          <div className="bg-white rounded-lg shadow-md p-2 mb-2">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-base font-medium text-gray-800">Color Extraction</h3>
              {/* Removed the Update button */}
            </div>
            <div>
              <label htmlFor="colorCount" className="block text-xs font-medium text-gray-700 mb-0.5">
                Number of Colors: {colorCount}
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs">2</span>
                <input
                  type="range"
                  id="colorCount"
                  min="2"
                  max="12"
                  value={colorCount}
                  onChange={(e) => setColorCount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs">12</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 italic">
                Adjusting automatically regenerates the colors.
              </p>
            </div>
          </div>

          {/* Add the Gradient Customizer component */}
          <GradientCustomizer 
            settings={customizationSettings}
            onSettingsChange={handleCustomizationChange}
          />

          {/* Add the Color Position Adjuster component */}
          {updatedPalette.colors.length > 1 && (
            <ColorPositionAdjuster 
              colors={updatedPalette.colors}
              customizationSettings={customizationSettings}
              onSettingsChange={handleCustomizationChange}
            />
          )}

          {/* Add "Upload a different image" button here */}
          <div className="text-center mt-2 mb-2">
            <button
              onClick={handleResetImage}
              className="w-full px-2 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm"
            >
              Upload a different image
            </button>
          </div>
        </div>
        
        {/* Create a container for the middle and right columns to ensure equal height */}
        <div className={`order-1 md:order-2 ${showVariations ? 'md:col-span-9' : 'md:col-span-6'} md:grid ${showVariations ? 'md:grid-cols-3' : 'md:grid-cols-1'} md:gap-2`}>
          {/* Middle column - Main gradient display */}
          <div className={showVariations ? 'md:col-span-2' : 'md:col-span-1'}>
            <div className="bg-white rounded-lg shadow-md p-2 mb-2 h-full">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-lg font-medium text-gray-800">Generated Gradient</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowVariations(!showVariations)}
                    disabled={stableLoading || stableLoadingVariations}
                    className="px-2 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm min-w-[120px] text-center"
                  >
                    {stableLoadingVariations ? "Generating..." : (showVariations ? "Hide Variations" : "Show Variations")}
                  </button>
                  <button 
                    onClick={downloadGradient}
                    disabled={stableLoading}
                    className="px-2 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm min-w-[100px] text-center"
                  >
                    {stableLoading ? 'Generating...' : 'Download'}
                  </button>
                </div>
              </div>
              
              {/* A4 aspect ratio container for the main gradient */}
              <div className="relative w-full rounded-lg shadow-lg overflow-hidden mb-2" 
                   style={{ paddingBottom: `${A4_ASPECT_RATIO * 100}%` }}>
                {selectedGradient ? (
                  <div 
                    className="absolute inset-0 w-full h-full"
                    style={{ background: selectedGradient.css }}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">Select a gradient to preview</p>
                  </div>
                )}
              </div>
              
              {selectedGradient && (
                <div className="bg-gray-50 p-1.5 rounded-md">
                  <p className="text-xs text-gray-700 font-medium mb-0.5">Type: {getGradientLabel(selectedGradient)}</p>
                  <p className="text-xs text-gray-500 font-mono overflow-x-auto whitespace-nowrap pb-0.5 text-[10px]">{selectedGradient.css}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column - Color Count Variations panel shown conditionally */}
          {showVariations && (
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-2 h-full">
                <h3 className="text-base font-medium mb-1 text-gray-800">Color Count Variations</h3>
                {stableLoadingVariations ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pb-1" style={{ height: "calc(100% - 30px)", overflowY: "auto" }}>
                    {memoizedColorCountVariations.map((variation) => (
                      <div 
                        key={`count-${variation.count}`} 
                        className={`flex flex-col items-center hover:bg-gray-50 p-1 rounded-lg cursor-pointer ${variation.count === colorCount ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => handleSelectColorCountVariation(variation.count, variation.palette)}
                      >
                        {/* A4 aspect ratio container for the thumbnail */}
                        <div className="relative w-full rounded-md shadow-sm overflow-hidden" 
                             style={{ paddingBottom: `${A4_ASPECT_RATIO * 100}%` }}>
                          {selectedGradient && (
                            <div 
                              className="absolute inset-0 w-full h-full"
                              style={{ 
                                background: createGradientPreview(selectedGradient.direction, variation.palette) 
                              }}
                            />
                          )}
                        </div>
                        <span className="text-xs mt-1 text-gray-600 font-medium">
                          {variation.count} Colors
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default GradientDisplay 