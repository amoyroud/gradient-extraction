import React, { Suspense, lazy, ComponentType } from 'react';

// Loading fallback for async components
export const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4 min-h-[100px]">
    <div className="animate-pulse flex space-x-2">
      <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
      <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
      <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
    </div>
  </div>
);

// Type for component loading function
type ComponentLoader<P> = () => Promise<{ default: ComponentType<P> }>;

// Creates a lazy-loaded component with Suspense wrapper
export function lazyLoad<P extends object>(
  importFunc: ComponentLoader<P>,
  fallback = <LoadingFallback />
) {
  const LazyComponent = lazy(importFunc);
  
  return (props: P) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Create a preload function for eager loading when hovering or on route change
export function createPreloadableComponent<P extends object>(
  importFunc: ComponentLoader<P>
) {
  const LazyComponent = lazyLoad(importFunc);
  
  // Add a preload method to trigger the import
  const preload = () => {
    importFunc();
  };
  
  return Object.assign(LazyComponent, { preload });
} 