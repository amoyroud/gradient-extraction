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
  const [positions, setPositions] = useState<number[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [showPercentages, setShowPercentages] = useState<boolean>(false);
  
  // Initialize positions based on customization settings or default even spacing
  useEffect(() => {
    const newPositions = customizationSettings.customColorPositions || 
      colors.map((_, index) => Math.round((index / (colors.length - 1)) * 100));
    
    // Ensure we have the right number of positions if colors change
    if (newPositions.length !== colors.length) {
      // Regenerate positions with equal spacing
      setPositions(colors.map((_, index) => Math.round((index / (colors.length - 1)) * 100)));
    } else {
      setPositions(newPositions);
    }
  }, [colors.length, customizationSettings.customColorPositions]);
  
  // Create a debounced version of the settings change handler
  // This reduces the number of updates during drag operations
  const debouncedSettingsChange = useCallback(
    debounce((newPositions: number[]) => {
      onSettingsChange({
        ...customizationSettings,
        customColorPositions: newPositions
      });
    }, 50), // 50ms debounce delay
    [customizationSettings, onSettingsChange]
  );
  
  // Update customization settings when positions change (except during drag)
  useEffect(() => {
    if (draggingIndex === null && positions.length === colors.length) {
      debouncedSettingsChange(positions);
    }
  }, [positions, draggingIndex, debouncedSettingsChange]);

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

  // Memoize the drag start handler
  const handleDragStart = useCallback((index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingIndex(index);
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
  }, []);

  // Optimize the drag handler
  const handleDrag = useCallback((e: MouseEvent) => {
    if (draggingIndex === null || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const height = rect.height;
    
    // Calculate the position as a percentage of container height
    let newPosition = ((e.clientY - rect.top) / height) * 100;
    
    // Clamp the position between adjacent dividers (or 0 and 100 for endpoints)
    if (draggingIndex === 0) {
      // First divider can only go to 0%
      newPosition = 0;
    } else if (draggingIndex === positions.length - 1) {
      // Last divider can only go to 100%
      newPosition = 100;
    } else {
      // Middle dividers are constrained between adjacent dividers
      // with a minimum gap of 2%
      const minPosition = positions[draggingIndex - 1] + 2;
      const maxPosition = draggingIndex < positions.length - 1 ? positions[draggingIndex + 1] - 2 : 100;
      
      newPosition = Math.max(minPosition, Math.min(newPosition, maxPosition));
    }
    
    // Update the positions array
    const newPositions = [...positions];
    newPositions[draggingIndex] = Math.round(newPosition);
    setPositions(newPositions);
    
    // Update the gradient in real-time during dragging with the debounced handler
    debouncedSettingsChange(newPositions);
  }, [draggingIndex, positions, debouncedSettingsChange]);

  // Memoize the drag end handler
  const handleDragEnd = useCallback(() => {
    setDraggingIndex(null);
    window.removeEventListener('mousemove', handleDrag);
    window.removeEventListener('mouseup', handleDragEnd);
  }, [handleDrag]);
  
  // Get height percentage for each color segment
  const getSegmentHeights = (): number[] => {
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
  };
  
  // Reset to default equal spacing
  const handleReset = () => {
    const defaultPositions = colors.map((_, index) => 
      Math.round((index / (colors.length - 1)) * 100)
    );
    setPositions(defaultPositions);
  };
  
  const segmentHeights = getSegmentHeights();
  
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
          {/* Dividers between colors */}
          {dividerPositions.map((position, index) => (
            <div
              key={index}
              className={`absolute left-0 right-0 h-1.5 bg-white bg-opacity-50 hover:bg-opacity-80 cursor-row-resize 
                        ${draggingIndex === index + 1 ? 'bg-opacity-80' : ''}`}
              style={{ 
                top: `calc(${position}% - 3px)`,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
              }}
              onMouseDown={handleDragStart(index + 1)}
              title="Drag to adjust color distribution"
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
        
        {/* Color squares next to gradient for better visualization */}
        <div className="flex flex-col h-64 justify-between">
          {colors.map((color, index) => (
            <div
              key={`color-${index}`}
              className="w-8 h-8 rounded-md shadow-sm"
              style={{ backgroundColor: color }}
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