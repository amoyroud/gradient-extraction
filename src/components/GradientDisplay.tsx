import React, { useState, useEffect } from 'react'
import { GradientDisplayProps, Gradient } from '../types'
import { generateGradients } from '../utils/gradientGenerator'

// A4 dimensions in pixels at 300 DPI
const A4_WIDTH_PX = 2480; // 210mm at 300dpi
const A4_HEIGHT_PX = 3508; // 297mm at 300dpi

// A4 aspect ratio for preview
const A4_ASPECT_RATIO = A4_HEIGHT_PX / A4_WIDTH_PX; // ~1.414

const GradientDisplay: React.FC<GradientDisplayProps> = ({ palette }) => {
  const [gradients, setGradients] = useState<Gradient[]>([])
  const [selectedGradient, setSelectedGradient] = useState<Gradient | null>(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    if (palette) {
      const generatedGradients = generateGradients(palette)
      setGradients(generatedGradients)
      setSelectedGradient(generatedGradients[0] || null)
    }
  }, [palette])
  
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
    if (!selectedGradient || !palette) return;
    
    try {
      // Show loading state
      setIsLoading(true);
      
      // Generate the A4 format gradient
      const dataUrl = await generateA4Gradient(selectedGradient, palette.colors);
      
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
    let baseClass = 'gradient-thumbnail w-16 h-16 shadow-sm transition-all hover:shadow-md';
    
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
  
  if (!gradients.length) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div 
          className="gradient-display portrait-orientation"
          style={{ backgroundImage: selectedGradient?.css }}
        >
          {selectedGradient && (
            <div className="gradient-label">
              {getGradientLabel(selectedGradient)}
            </div>
          )}
        </div>
      </div>
      
      <div className="gradient-options">
        {gradients.map((gradient) => (
          <button
            key={gradient.id}
            className={getGradientThumbnailClass(gradient)}
            style={{ backgroundImage: gradient.css }}
            onClick={() => setSelectedGradient(gradient)}
            title={`${gradient.type} gradient - ${gradient.direction}`}
          />
        ))}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="gradient-info flex-grow">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">CSS Code</h4>
            <button 
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => copyToClipboard(selectedGradient?.css || '')}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-gray-800 text-gray-100 p-3 rounded text-sm overflow-x-auto">
            {`background-image: ${selectedGradient?.css};`}
          </pre>
        </div>
        
        <button
          onClick={downloadGradient}
          disabled={isLoading}
          className="btn btn-primary py-3 px-6 rounded-lg flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              Generating...
            </>
          ) : (
            'Download A4 Portrait'
          )}
        </button>
      </div>
    </div>
  )
}

export default GradientDisplay 