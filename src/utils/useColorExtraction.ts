import { useState, useEffect } from 'react';
import { ColorPalette } from '../types';

// Maximum dimensions to resize an image to before processing
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

// React hook for color extraction using web workers
export function useColorExtraction() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create worker instance lazily to ensure it's only created in the browser
  const getWorker = () => {
    const worker = new Worker(
      new URL('../workers/colorExtraction.worker.ts', import.meta.url),
      { type: 'module' }
    );
    return worker;
  };
  
  // Main extraction function
  const extractColors = async (
    imageUrl: string,
    colorCount: number = 8
  ): Promise<ColorPalette> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Load image
      const img = await loadImage(imageUrl);
      
      // Resize image for faster processing
      const canvas = resizeImageForAnalysis(img);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Get pixel data from the resized image
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use worker for processing
      const worker = getWorker();
      
      // Wrap worker processing in a promise
      const palette = await new Promise<ColorPalette>((resolve, reject) => {
        worker.onmessage = (event) => {
          const { success, palette, error } = event.data;
          
          // Clean up the worker
          worker.terminate();
          
          if (success) {
            resolve(palette);
          } else {
            reject(new Error(error || 'Unknown error in worker'));
          }
        };
        
        worker.onerror = (e) => {
          // Clean up on error
          worker.terminate();
          reject(new Error('Error in color extraction worker: ' + e.message));
        };
        
        // Start processing
        worker.postMessage({ imageData, colorCount });
      });
      
      return palette;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    extractColors,
    isProcessing,
    error
  };
}

// Helper function to load an image
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
} 