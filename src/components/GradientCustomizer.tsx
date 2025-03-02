import React, { useCallback } from 'react';

export interface GradientCustomizationSettings {
  blendHardness: number;  // 0-100 scale (0=hardest, 100=softest)
  colorDiffusion?: number; // Optional: 0 (tight) to 100 (wide spread)
  glowIntensity?: number; // Optional: 0 (none) to 100 (intense)
  atmosphericHaze?: number; // Optional: 0 (none) to 100 (heavy)
  customColorPositions?: number[]; // Optional: positions for each color
}

interface GradientCustomizerProps {
  settings: GradientCustomizationSettings;
  onSettingsChange: (newSettings: GradientCustomizationSettings) => void;
}

// Use React.memo to prevent re-renders when props haven't changed
const GradientCustomizer: React.FC<GradientCustomizerProps> = React.memo(({ 
  settings, 
  onSettingsChange 
}) => {
  // Create a stable callback function to handle slider changes
  const handleSliderChange = useCallback((setting: keyof GradientCustomizationSettings, value: number) => {
    onSettingsChange({
      ...settings,
      [setting]: value
    });
  }, [settings, onSettingsChange]);

  // Create a stable callback function to format slider label
  const formatPercentage = useCallback((value: number) => {
    return `${value}%`;
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Customize Gradient</h3>
      
      <div className="space-y-4">
        {/* Color Diffusion slider - REMOVED */}
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            Use the color distribution adjuster below to customize how colors blend.
          </p>
        </div>
      </div>
    </div>
  );
});

export default GradientCustomizer; 