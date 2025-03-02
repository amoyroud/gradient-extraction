import { v4 as uuidv4 } from 'uuid'
import { ColorPalette, Gradient, GradientCustomizationSettings } from '../types'

// Helper function to apply customization settings to the gradient generation
const applyCustomizationSettings = (
  colors: string[],
  settings: GradientCustomizationSettings
): string => {
  // If no settings provided, return default gradient with even color distribution
  if (!settings) {
    const step = 100 / (colors.length - 1);
    return colors.map((color, index) => `${color} ${index * step}%`).join(', ');
  }

  // Get the blend hardness from settings (default to 50 if not provided)
  const { blendHardness = 50, customColorPositions } = settings;
  
  // If custom color positions are provided, use them to position colors
  if (customColorPositions && customColorPositions.length === colors.length) {
    return colors.map((color, index) => 
      `${color} ${customColorPositions[index]}%`
    ).join(', ');
  }
  
  // Otherwise, use the blend hardness to determine transition smoothness
  // Higher blend hardness = harder color transitions (more distinct)
  // Lower blend hardness = softer transitions (more blending)
  const transitionSmoothness = 1 - (blendHardness / 100);
  
  // Build color stops
  const colorStops: string[] = [];
  const totalColors = colors.length;
  
  for (let i = 0; i < totalColors; i++) {
    const basePosition = (i / (totalColors - 1)) * 100;
    
    // Calculate overlap based on transition smoothness
    // More smoothness = more overlap between colors
    const overlap = Math.max(1, 20 * transitionSmoothness);
    
    // For the first color
    if (i === 0) {
      colorStops.push(`${colors[i]} 0%`);
      
      // Add an extended stop if we want smooth transitions
      if (transitionSmoothness > 0.1) {
        colorStops.push(`${colors[i]} ${overlap}%`);
      }
    } 
    // For the last color
    else if (i === totalColors - 1) {
      // Add an earlier stop if we want smooth transitions
      if (transitionSmoothness > 0.1) {
        colorStops.push(`${colors[i]} ${100 - overlap}%`);
      }
      
      colorStops.push(`${colors[i]} 100%`);
    } 
    // For middle colors
    else {
      // Create smoother transitions by positioning colors with overlap
      const spreadBefore = Math.max(0, basePosition - (overlap / 2));
      const spreadAfter = Math.min(100, basePosition + (overlap / 2));
      
      // For harder transitions, keep colors at their exact positions
      if (transitionSmoothness < 0.1) {
        colorStops.push(`${colors[i]} ${basePosition}%`);
      } else {
        // For softer transitions, create color stops before and after the position
        colorStops.push(`${colors[i]} ${spreadBefore}%`);
        colorStops.push(`${colors[i]} ${basePosition}%`);
        colorStops.push(`${colors[i]} ${spreadAfter}%`);
      }
    }
  }
  
  return colorStops.join(', ');
};

// Generate a collection of gradients from a color palette
export const generateGradients = (
  palette: ColorPalette, 
  customizationSettings?: GradientCustomizationSettings
): Gradient[] => {
  const { colors } = palette
  const gradients: Gradient[] = []
  
  // Use provided customization settings or defaults
  const settings: GradientCustomizationSettings = customizationSettings || {
    blendHardness: 50,  // Default is moderate hardness
  };
  
  // For sunset/sunrise images, we prioritize linear gradients with various vertical options first
  // Note: 'to bottom' variations are first, as requested by the user
  const linearDirections = [
    // Vertical gradient variations should be the first ones shown
    { name: 'to bottom', value: 'to bottom' },
    { name: 'to bottom (soft)', value: 'to bottom', customStops: true, style: 'soft' },
    { name: 'to bottom (emphasized)', value: 'to bottom', customStops: true, style: 'emphasized' },
    { name: 'to bottom (balanced)', value: 'to bottom', customStops: true, style: 'balanced' },
    // Slightly angled vertical gradients
    { name: 'to bottom slight right', value: '170deg' },
    { name: 'to bottom slight left', value: '190deg' },
    // Horizontal gradients (left-to-right and right-to-left) for natural sunset/sunrise transitions
    { name: 'to right', value: 'to right' },
    { name: 'to left', value: 'to left' },
    // Diagonal gradients can sometimes represent the angle of light during sunset/sunrise
    { name: 'to bottom right', value: 'to bottom right' },
    { name: 'to bottom left', value: 'to bottom left' }
  ]
  
  // Helper function to create custom color stops for more nuanced gradients
  const createCustomColorStops = (colors: string[], style: string): string => {
    const colorsCopy = [...colors];
    
    // If custom color positions are provided, use them regardless of style
    if (settings.customColorPositions && settings.customColorPositions.length === colors.length) {
      return applyCustomizationSettings(colorsCopy, settings);
    }
    
    switch (style) {
      case 'soft':
        // Softer transition with more emphasis on middle colors
        // Apply customization settings if they exist, with adjusted hardness
        return applyCustomizationSettings(colorsCopy, {
          ...settings,
          blendHardness: Math.max(0, settings.blendHardness - 20), // Less hardness = softer
        });
        
      case 'emphasized':
        // Emphasize the first color more
        // Apply customization settings if they exist, with adjusted hardness
        return applyCustomizationSettings(colorsCopy, {
          ...settings,
          blendHardness: Math.max(0, settings.blendHardness - 10), // Slightly less hardness
        });
        
      case 'balanced':
        // More balanced distribution with distinct bands
        // Apply customization settings if they exist, with adjusted hardness
        return applyCustomizationSettings(colorsCopy, {
          ...settings,
          blendHardness: Math.min(100, settings.blendHardness + 10), // More hardness = more distinct
        });
        
      default:
        // Apply the customization settings directly
        return applyCustomizationSettings(colorsCopy, settings);
    }
  };
  
  // Generate linear gradients that showcase sunset/sunrise colors
  linearDirections.forEach(direction => {
    // For horizontal gradients, we want to maintain the correct order of colors
    const gradientColors = [...colors];
    
    // Determine the CSS value based on whether we need custom color stops
    let cssValue: string;
    
    if (direction.customStops && direction.style) {
      cssValue = `linear-gradient(${direction.value}, ${createCustomColorStops(gradientColors, direction.style)})`;
    } else {
      // Apply customization settings directly
      cssValue = `linear-gradient(${direction.value}, ${applyCustomizationSettings(gradientColors, settings)})`;
    }
    
    gradients.push({
      id: uuidv4(),
      type: 'linear',
      direction: direction.name,
      css: cssValue,
      customizationSettings: settings,
    });
  });
  
  return gradients
} 