export interface ColorPalette {
  colors: string[];
  dominant: string;
}

export interface GradientCustomizationSettings {
  blendHardness: number;  // 0 (hardest) to 100 (softest)
  colorDiffusion?: number; // Optional: 0 (tight) to 100 (wide spread)
  glowIntensity?: number; // Optional: 0 (none) to 100 (intense)
  atmosphericHaze?: number; // Optional: 0 (none) to 100 (heavy)
  customColorPositions?: number[]; // Optional: positions (0-100) for each color
}

export interface Gradient {
  id: string;
  type: 'linear' | 'radial' | 'conic';
  direction: string;
  css: string;
  customizationSettings?: GradientCustomizationSettings;
}

export interface ImageUploaderProps {
  onImageUpload: (url: string | null) => void;
  onPaletteExtracted: (palette: ColorPalette | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export interface GradientDisplayProps {
  palette: ColorPalette;
} 