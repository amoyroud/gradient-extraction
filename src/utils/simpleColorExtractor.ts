import { ColorPalette } from '../types';

// Helper to convert RGB to HEX format
const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Calculate perceived brightness using YIQ formula
const getBrightness = (hex: string): number => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
};

// Maximum dimensions to resize an image to before processing
// Reduces processing time while maintaining sufficient color fidelity
const MAX_ANALYSIS_WIDTH = 800;
const MAX_ANALYSIS_HEIGHT = 800;

// Resize image for faster processing while maintaining color fidelity
const resizeImageForAnalysis = (img: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  let width = img.width;
  let height = img.height;
  
  // Only resize if the image is larger than our maximum dimensions
  if (width > MAX_ANALYSIS_WIDTH || height > MAX_ANALYSIS_HEIGHT) {
    const ratio = Math.min(
      MAX_ANALYSIS_WIDTH / width,
      MAX_ANALYSIS_HEIGHT / height
    );
    
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }
  
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Use high-quality image resizing
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
  }
  
  return canvas;
};

// Extract dominant color from a specific region of pixel data
const getDominantColorFromRegion = (
  data: Uint8ClampedArray,
  width: number,
  startY: number,
  endY: number
): string => {
  // Create bins for colors in this region
  const colorBins: Record<string, { count: number; r: number; g: number; b: number }> = {};
  
  // Analyze pixels in this horizontal slice
  for (let y = startY; y < endY; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4;
      
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];
      const a = data[pixelIndex + 3];
      
      // Skip transparent pixels
      if (a < 128) continue;
      
      // Simplify colors by rounding to reduce the number of unique colors
      const roundedR = Math.round(r / 10) * 10;
      const roundedG = Math.round(g / 10) * 10;
      const roundedB = Math.round(b / 10) * 10;
      
      const key = `${roundedR}-${roundedG}-${roundedB}`;
      
      if (!colorBins[key]) {
        colorBins[key] = { count: 0, r, g, b };
      }
      
      colorBins[key].count++;
    }
  }
  
  // Sort bins by count and get the most common color
  const sortedBins = Object.values(colorBins).sort((a, b) => b.count - a.count);
  
  if (sortedBins.length === 0) {
    // If no colors were found in this slice (e.g., all transparent), return a default color
    return '#ffffff';
  }
  
  // Return the most dominant color in this region
  const dominantColor = sortedBins[0];
  return rgbToHex(dominantColor.r, dominantColor.g, dominantColor.b);
};

// Extract colors by horizontal slices from image
export const extractColors = (
  imageUrl: string,
  colorCount: number = 8
): Promise<ColorPalette> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        // Resize image for faster processing
        const canvas = resizeImageForAnalysis(img);
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Get pixel data from the resized image
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixelData = imageData.data;
        
        // Divide the image into horizontal slices and get the dominant color from each
        const sliceColors: string[] = [];
        const sliceHeight = Math.max(1, Math.floor(canvas.height / colorCount));
        
        for (let i = 0; i < colorCount; i++) {
          const startY = i * sliceHeight;
          const endY = (i === colorCount - 1) ? canvas.height : (i + 1) * sliceHeight;
          
          const dominantColor = getDominantColorFromRegion(
            pixelData,
            canvas.width,
            startY,
            endY
          );
          
          sliceColors.push(dominantColor);
        }
        
        // Make sure we have the exact number of colors requested
        while (sliceColors.length < colorCount) {
          // Duplicate the last color if we don't have enough
          sliceColors.push(sliceColors[sliceColors.length - 1] || '#ffffff');
        }
        
        // For sunsets/sunrises we typically want dark colors at the top and lighter at the bottom
        // Sort just to ensure a pleasing gradient in case the image has unusual color distribution
        const sortedColors = [...sliceColors].sort((a, b) => getBrightness(a) - getBrightness(b));
        
        resolve({
          dominant: sliceColors[Math.floor(sliceColors.length / 2)], // Middle color as dominant
          colors: sliceColors // Keep original top-to-bottom order to preserve image gradient
        });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}; 