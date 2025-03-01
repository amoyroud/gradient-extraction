import { v4 as uuidv4 } from 'uuid'
import { ColorPalette, Gradient } from '../types'

// Generate a collection of gradients from a color palette
export const generateGradients = (palette: ColorPalette): Gradient[] => {
  const { colors } = palette
  const gradients: Gradient[] = []
  
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
    
    switch (style) {
      case 'soft':
        // Softer transition with more emphasis on middle colors
        return colorsCopy.map((color, index) => {
          const position = index === 0 ? 0 : 
                          index === colors.length - 1 ? 100 : 
                          Math.round(((index / (colors.length - 1)) * 60) + 20);
          return `${color} ${position}%`;
        }).join(', ');
        
      case 'emphasized':
        // Emphasize the first color more
        return colorsCopy.map((color, index) => {
          const position = index === 0 ? 0 : 
                          index === colors.length - 1 ? 100 : 
                          Math.round(((index / (colors.length - 1)) * 70) + 30);
          return `${color} ${position}%`;
        }).join(', ');
        
      case 'balanced':
        // More balanced distribution with distinct bands
        return colorsCopy.map((color, index) => {
          // Calculate even spacing with slight overlap
          const start = Math.max(0, Math.round((index / colors.length) * 100) - 5);
          const end = Math.min(100, Math.round(((index + 1) / colors.length) * 100) + 5);
          return index === colors.length - 1 ? 
                `${color} ${start}%` : 
                `${color} ${start}%, ${color} ${end}%`;
        }).join(', ');
        
      default:
        return colorsCopy.join(', ');
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
      cssValue = `linear-gradient(${direction.value}, ${gradientColors.join(', ')})`;
    }
    
    gradients.push({
      id: uuidv4(),
      type: 'linear',
      direction: direction.name,
      css: cssValue
    });
  });
  
  return gradients
} 