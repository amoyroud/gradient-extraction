// Web Worker for Color Extraction
// This offloads the CPU-intensive color extraction to a background thread

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
const MAX_ANALYSIS_WIDTH = 800;
const MAX_ANALYSIS_HEIGHT = 800;

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

// Process image data to extract colors
const processImageData = (
  imageData: ImageData,
  colorCount: number
): { dominant: string; colors: string[] } => {
  const pixelData = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // Divide the image into horizontal slices and get the dominant color from each
  const sliceColors: string[] = [];
  const sliceHeight = Math.max(1, Math.floor(height / colorCount));
  
  for (let i = 0; i < colorCount; i++) {
    const startY = i * sliceHeight;
    const endY = (i === colorCount - 1) ? height : (i + 1) * sliceHeight;
    
    const dominantColor = getDominantColorFromRegion(
      pixelData,
      width,
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
  
  return {
    dominant: sliceColors[Math.floor(sliceColors.length / 2)], // Middle color as dominant
    colors: sliceColors // Keep original top-to-bottom order to preserve image gradient
  };
};

// Handle messages from the main thread
self.onmessage = (event: MessageEvent) => {
  const { imageData, colorCount } = event.data;
  
  try {
    const result = processImageData(imageData, colorCount);
    self.postMessage({ success: true, palette: result });
  } catch (error) {
    self.postMessage({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// TypeScript requires this for workers
export default {} as typeof Worker & { new(): Worker }; 