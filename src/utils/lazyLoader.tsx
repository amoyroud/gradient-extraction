import { Suspense, lazy, ComponentType } from 'react';

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

// Creates a lazy-loaded component with Suspense wrapper
export function lazyLoad<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback = <LoadingFallback />
) {
  const LazyComponent = lazy(importFunc);
  
  return function WrappedComponent(props: P) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Create a preload function for eager loading when hovering or on route change
export function createPreloadableComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  preloadFn?: () => void
) {
  const LazyComponent = lazy(importFn);

  const PreloadableComponent = (props: P) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );

  PreloadableComponent.preload = () => {
    if (preloadFn) {
      preloadFn();
    }
    importFn();
  };

  return PreloadableComponent;
} 