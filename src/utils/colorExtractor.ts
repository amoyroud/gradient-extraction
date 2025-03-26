// @ts-ignore
import { ColorThief as ColorThiefTs, RGBColor } from 'color-thief-ts'
import { ColorPalette } from '../types'

// Helper to convert RGB to HEX format
const rgbToHex = (rgb: RGBColor): string => {
  const [r, g, b] = rgb
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

// Extract colors from image URL
export const extractColors = async (imageUrl: string): Promise<ColorPalette> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    
    img.onload = async () => {
      try {
        const colorThief = new ColorThiefTs()
        
        // Get the dominant color
        const dominantRgb = await colorThief.getColor(img)
        const dominant = rgbToHex(dominantRgb)
        
        // Get the color palette (8 colors)
        const paletteRgb = await colorThief.getPalette(img, 8)
        const colors = paletteRgb.map((rgb: RGBColor) => rgbToHex(rgb))
        
        // Sort colors to create a more visually pleasing gradient (from darker to lighter)
        const sortedColors = [...colors].sort((a, b) => {
          // Calculate perceived brightness using YIQ formula
          const getBrightness = (hex: string): number => {
            const r = parseInt(hex.slice(1, 3), 16)
            const g = parseInt(hex.slice(3, 5), 16)
            const b = parseInt(hex.slice(5, 7), 16)
            return (r * 299 + g * 587 + b * 114) / 1000
          }
          
          return getBrightness(a) - getBrightness(b)
        })
        
        resolve({
          dominant,
          colors: sortedColors
        })
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = imageUrl
  })
} 