import { useState, useCallback, useRef, useEffect } from 'react';
import { ColorPalette, Gradient, GradientCustomizationSettings } from '../types';
import { generateGradients } from './gradientGenerator';

// Cache key generator for gradients
const getCacheKey = (
  palette: ColorPalette,
  settings?: GradientCustomizationSettings
): string => {
  const colorsKey = palette.colors.join(':');
  const settingsKey = settings ? 
    `${settings.blendHardness}:${settings.customColorPositions?.join(',') || ''}` : 
    'default';
  return `${colorsKey}|${settingsKey}`;
};

// Maximum number of items to keep in the cache
const MAX_CACHE_SIZE = 20;

// Interface for the gradient cache
interface GradientCache {
  [key: string]: {
    gradients: Gradient[];
    timestamp: number;
  };
}

/**
 * Custom hook for efficiently caching gradient generation results
 */
export const useGradientCache = () => {
  // Use a ref for the cache to maintain it between renders without causing re-renders
  const cacheRef = useRef<GradientCache>({});
  const [cacheHits, setCacheHits] = useState(0);
  const [cacheMisses, setCacheMisses] = useState(0);
  
  // Clear the oldest cache entries when the cache gets too large
  const trimCache = useCallback(() => {
    const cache = cacheRef.current;
    const entries = Object.entries(cache);
    
    if (entries.length > MAX_CACHE_SIZE) {
      // Sort by timestamp (oldest first)
      const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest entries
      const entriesToRemove = entries.length - MAX_CACHE_SIZE;
      for (let i = 0; i < entriesToRemove; i++) {
        delete cache[sortedEntries[i][0]];
      }
    }
  }, []);
  
  // Cached version of gradient generation
  const getGradients = useCallback((
    palette: ColorPalette,
    settings?: GradientCustomizationSettings
  ): Gradient[] => {
    const cacheKey = getCacheKey(palette, settings);
    const cache = cacheRef.current;
    
    // Return from cache if available
    if (cache[cacheKey]) {
      // Update the timestamp to mark this as recently used
      cache[cacheKey].timestamp = Date.now();
      setCacheHits(prev => prev + 1);
      return cache[cacheKey].gradients;
    }
    
    // Generate new gradients if not in cache
    const newGradients = generateGradients(palette, settings);
    
    // Add to cache
    cache[cacheKey] = {
      gradients: newGradients,
      timestamp: Date.now()
    };
    
    setCacheMisses(prev => prev + 1);
    
    // Trim cache if needed
    trimCache();
    
    return newGradients;
  }, [trimCache]);
  
  // Clear the cache
  const clearCache = useCallback(() => {
    cacheRef.current = {};
    setCacheHits(0);
    setCacheMisses(0);
  }, []);
  
  // Log cache performance metrics
  useEffect(() => {
    const totalRequests = cacheHits + cacheMisses;
    if (totalRequests > 0 && totalRequests % 10 === 0) {
      const hitRate = (cacheHits / totalRequests) * 100;
      console.log(`Gradient cache performance: ${hitRate.toFixed(1)}% hit rate (${cacheHits} hits, ${cacheMisses} misses)`);
    }
  }, [cacheHits, cacheMisses]);
  
  return {
    getGradients,
    clearCache,
    cacheHits,
    cacheMisses
  };
}; 