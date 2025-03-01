export interface ColorPalette {
  colors: string[];
  dominant: string;
}

export interface Gradient {
  id: string;
  type: 'linear' | 'radial' | 'conic';
  direction: string;
  css: string;
}

export interface ImageUploaderProps {
  onImageUpload: (url: string | null) => void;
  onPaletteExtracted: (palette: ColorPalette | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export interface GradientDisplayProps {
  palette: ColorPalette;
} 