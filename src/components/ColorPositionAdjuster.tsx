import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GradientCustomizationSettings } from '../types';

interface ColorPositionAdjusterProps {
  colors: string[];
  customizationSettings: GradientCustomizationSettings;
  onSettingsChange: (newSettings: GradientCustomizationSettings) => void;
}

// Debounce function for better performance
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

const ColorPositionAdjuster: React.FC<ColorPositionAdjusterProps> = React.memo(({ 
  colors, 
  customizationSettings, 
  onSettingsChange 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const dragEndHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const currentDraggingIndexRef = useRef<number | null>(null);
  
  // Initialize positions using a memoized value to avoid render-time updates
  const initialPositions = useMemo(() => {
    const defaultPositions = colors.map((_, index) => Math.round((index / (colors.length - 1)) * 100));
    return customizationSettings.customColorPositions || defaultPositions;
  }, [colors, customizationSettings.customColorPositions]);
  
  const [positions, setPositions] = useState<number[]>(initialPositions);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [showPercentages, setShowPercentages] = useState<boolean>(false);
  
  // Create a debounced version of the settings change handler
  const debouncedSettingsChange = useCallback(
    debounce((newPositions: number[]) => {
      const newSettings = {
        ...customizationSettings,
        customColorPositions: newPositions
      };
      onSettingsChange(newSettings);
    }, 50),
    [customizationSettings, onSettingsChange]
  );

  // Define the drag handler
  const handleDrag = useCallback((e: MouseEvent) => {
    console.log('[DEBUG] handleDrag called', { currentDraggingIndex: currentDraggingIndexRef.current, e: { clientY: e.clientY } });
    
    if (currentDraggingIndexRef.current === null || !containerRef.current) {
      console.log('[DEBUG] Early return - draggingIndex or container missing', { 
        draggingIndex: currentDraggingIndexRef.current, 
        hasContainer: !!containerRef.current 
      });
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate the position as a percentage of container height
    let newPosition = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp the position between adjacent dividers
    const minPosition = currentDraggingIndexRef.current > 0 ? positions[currentDraggingIndexRef.current - 1] + 2 : 0;
    const maxPosition = currentDraggingIndexRef.current < positions.length - 1 ? positions[currentDraggingIndexRef.current + 1] - 2 : 100;
    
    // Ensure the position stays within bounds
    newPosition = Math.max(minPosition, Math.min(maxPosition, newPosition));
    newPosition = Math.round(newPosition);
    
    // Only update if position has changed
    if (newPosition !== positions[currentDraggingIndexRef.current]) {
      const newPositions = [...positions];
      newPositions[currentDraggingIndexRef.current] = newPosition;
      setPositions(newPositions);
      
      // Immediately update settings with new positions
      const newSettings = {
        ...customizationSettings,
        customColorPositions: newPositions
      };
      onSettingsChange(newSettings);
      
      console.log('[DEBUG] Updated positions:', newPositions);
      console.log('[DEBUG] Sent new settings:', newSettings);
    }
  }, [positions, customizationSettings, onSettingsChange]);

  // Define the drag start handler
  const handleDragStart = useCallback((index: number) => (e: React.MouseEvent) => {
    console.log('[DEBUG] handleDragStart called', { index });
    e.preventDefault();
    e.stopPropagation();
    
    // Set dragging index first
    currentDraggingIndexRef.current = index;
    setDraggingIndex(index);
    
    // Store the handlers in local variables to ensure we use the same instance
    const dragHandler = dragHandlerRef.current;
    const dragEndHandler = dragEndHandlerRef.current;
    
    // Update handlers in refs immediately
    if (dragHandler && dragEndHandler) {
      // Prevent text selection during dragging
      document.body.style.userSelect = 'none';
      
      // Add event listeners using the stored handlers
      window.addEventListener('mousemove', dragHandler);
      window.addEventListener('mouseup', dragEndHandler);
      
      console.log('[DEBUG] Event listeners added', { 
        hasMouseMove: !!dragHandler, 
        hasMouseUp: !!dragEndHandler,
        currentIndex: currentDraggingIndexRef.current 
      });
    } else {
      console.log('[DEBUG] Failed to add event listeners - handlers not ready', {
        hasDragHandler: !!dragHandler,
        hasDragEndHandler: !!dragEndHandler
      });
    }
  }, []);

  // Memoize the drag end handler
  const handleDragEnd = useCallback((e?: MouseEvent) => {
    console.log('[DEBUG] handleDragEnd called');
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    currentDraggingIndexRef.current = null;
    setDraggingIndex(null);
    document.body.style.userSelect = '';
    
    // Remove event listeners using the refs
    if (dragHandlerRef.current) {
      window.removeEventListener('mousemove', dragHandlerRef.current);
    }
    if (dragEndHandlerRef.current) {
      window.removeEventListener('mouseup', dragEndHandlerRef.current);
    }
  }, []);

  // Store the drag handler in a ref
  useEffect(() => {
    console.log('[DEBUG] Updating drag handler ref');
    dragHandlerRef.current = handleDrag;
    return () => {
      dragHandlerRef.current = null;
    };
  }, [handleDrag]);

  // Store the drag end handler in a ref
  useEffect(() => {
    console.log('[DEBUG] Updating drag end handler ref');
    dragEndHandlerRef.current = handleDragEnd;
    return () => {
      dragEndHandlerRef.current = null;
    };
  }, [handleDragEnd]);

  // Update positions when colors or customization settings change
  useEffect(() => {
    if (!draggingIndex) { // Only update positions if we're not currently dragging
      const newPositions = customizationSettings.customColorPositions || 
        colors.map((_, index) => Math.round((index / (colors.length - 1)) * 100));
      
      if (newPositions.length !== colors.length) {
        setPositions(colors.map((_, index) => Math.round((index / (colors.length - 1)) * 100)));
      } else {
        setPositions(newPositions);
      }
    }
  }, [colors.length, customizationSettings.customColorPositions, colors, draggingIndex]);

  // Reset to default equal spacing
  const handleReset = useCallback(() => {
    const defaultPositions = colors.map((_, index) => 
      Math.round((index / (colors.length - 1)) * 100)
    );
    setPositions(defaultPositions);
  }, [colors]);
  
  // Calculate divider positions (between colors) - memoized to prevent recalculation
  const getDividerPositions = useCallback((): number[] => {
    const dividers: number[] = [];
    
    // For each pair of adjacent colors, calculate the divider position
    for (let i = 1; i < positions.length; i++) {
      dividers.push(positions[i]);
    }
    
    return dividers;
  }, [positions]);
  
  // Memoize the divider positions to prevent unnecessary recalculation
  const dividerPositions = useMemo(() => getDividerPositions(), [getDividerPositions]);

  // Get height percentage for each color segment
  const getSegmentHeights = useCallback((): number[] => {
    const heights: number[] = [];
    
    // First segment: from 0 to first divider
    heights.push(positions[1]);
    
    // Middle segments: between dividers
    for (let i = 1; i < positions.length - 1; i++) {
      heights.push(positions[i + 1] - positions[i]);
    }
    
    // Last segment: from last divider to 100%
    heights.push(100 - positions[positions.length - 1]);
    
    return heights;
  }, [positions]);

  // Memoize segment heights to prevent recalculation
  const segmentHeights = useMemo(() => getSegmentHeights(), [getSegmentHeights]);

  return (
    <div className="bg-white rounded-lg shadow-md p-2 mb-2">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-base font-medium text-gray-800">Color Distribution</h3>
        <button 
          onClick={handleReset}
          className="text-xs text-gray-500 underline hover:text-gray-700"
        >
          Reset
        </button>
      </div>
      
      <div className="flex space-x-3">
        {/* Vertical gradient preview with draggable dividers */}
        <div 
          ref={containerRef}
          className="relative w-40 h-64 rounded-md overflow-hidden mb-1 cursor-row-resize"
          style={{ 
            background: `linear-gradient(to bottom, ${
              colors.map((color, i) => `${color} ${positions[i]}%`).join(', ')
            })`
          }}
        >
          {/* Add dividers */}
          {positions.slice(1, -1).map((position, index) => (
            <div
              key={index}
              className="absolute left-0 w-full h-1 bg-white/30 cursor-row-resize hover:bg-white/50 transition-colors"
              style={{ 
                top: `${position}%`,
                transform: 'translateY(-50%)',
                cursor: draggingIndex === index + 1 ? 'grabbing' : 'grab'
              }}
              onMouseDown={(e) => {
                console.log('[DEBUG] Divider clicked:', { index: index + 1 });
                handleDragStart(index + 1)(e);
              }}
            />
          ))}
          
          {/* Percentage labels */}
          {(showPercentages || draggingIndex !== null) && colors.map((color, index) => {
            // Calculate segment height percentage
            const height = index === 0 ? positions[1] : 
                          index === colors.length - 1 ? (100 - positions[positions.length - 1]) : 
                          (positions[index + 1] - positions[index]);
                          
            // Only show percentage for segments tall enough
            if (height < 8) return null;
            
            return (
              <div
                key={`percent-${index}`}
                className="absolute right-2 text-xs text-white font-bold drop-shadow-md text-center"
                style={{ 
                  top: `${index === 0 ? 0 : positions[index]}%`, 
                  height: `${height}%`,
                  display: 'flex',
                  alignItems: 'center',
                  textShadow: '0px 0px 2px rgba(0,0,0,0.8)'
                }}
              >
                {Math.round(height)}%
              </div>
            );
          })}
        </div>
        
        {/* Color swatches */}
        <div className="flex flex-col space-y-1">
          {colors.map((color, index) => (
            <div
              key={index}
              className="w-10 h-10 rounded-md shadow-sm"
              style={{ 
                backgroundColor: color,
                marginTop: index === 0 ? '0' : `${positions[index] - positions[index-1]}%`
              }}
              title={color}
            />
          ))}
        </div>
      </div>
      
      <p className="text-xs text-gray-500 italic mt-1">
        Drag the dividers to adjust how much of each color appears in the gradient
      </p>
    </div>
  );
});

export default ColorPositionAdjuster; 