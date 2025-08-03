// ============================================================================
// GLOBAL COLOR SYSTEM - Change colors from one location
// ============================================================================

// ============================================================================
// MASTER COLOR - IDE-FRIENDLY RGBA FORMAT
// ============================================================================

// MASTER COLOR - RGBA format for IDE color picker
export const MASTER_COLOR_RGBA = 'rgb(173, 126, 233)'; // Light mint green with 30% opacity

// ============================================================================
// COLOR SYSTEM - SIMPLIFIED FOR RGBA MASTER COLOR
// ============================================================================

// All colors are now direct values for IDE color picker support

// ============================================================================
// COLOR UTILITIES FOR DYNAMIC PALETTE GENERATION
// ============================================================================

// Extract RGB values from the master color
export const extractRgbFromString = (colorString: string): { r: number, g: number, b: number } => {
  const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]), 
      b: parseInt(match[3])
    };
  }
  return { r: 145, g: 253, b: 145 }; // Fallback to your current color
};

// RGB to Hex conversion with bounds checking
export const rgbToHex = (r: number, g: number, b: number): string => {
  // Clamp values to 0-255 range
  const clampedR = Math.max(0, Math.min(255, Math.round(r)));
  const clampedG = Math.max(0, Math.min(255, Math.round(g)));
  const clampedB = Math.max(0, Math.min(255, Math.round(b)));
  return `#${((1 << 24) + (clampedR << 16) + (clampedG << 8) + clampedB).toString(16).slice(1)}`;
};

// RGB to RGBA conversion with bounds checking
export const rgbToRgba = (r: number, g: number, b: number, alpha: number): string => {
  // Clamp values to 0-255 range
  const clampedR = Math.max(0, Math.min(255, Math.round(r)));
  const clampedG = Math.max(0, Math.min(255, Math.round(g)));
  const clampedB = Math.max(0, Math.min(255, Math.round(b)));
  return `rgba(${clampedR}, ${clampedG}, ${clampedB}, ${alpha})`;
};

// ============================================================================
// DYNAMIC COLOR PALETTE GENERATION
// ============================================================================

// Extract RGB from master color
const MASTER_RGB = extractRgbFromString(MASTER_COLOR_RGBA);

// Generate color palette dynamically from master color
export const COLORS = {
  // Primary colors - Generated from master color
  primary: rgbToHex(MASTER_RGB.r, MASTER_RGB.g, MASTER_RGB.b),
  primaryLight: rgbToHex(MASTER_RGB.r + 30, MASTER_RGB.g + 30, MASTER_RGB.b + 30),
  primaryDark: rgbToHex(MASTER_RGB.r - 30, MASTER_RGB.g - 30, MASTER_RGB.b - 30),
  
  // Background colors - Generated from master color
  background: rgbToHex(MASTER_RGB.r + 50, MASTER_RGB.g + 50, MASTER_RGB.b + 50),
  backgroundLight: rgbToHex(MASTER_RGB.r + 80, MASTER_RGB.g + 80, MASTER_RGB.b + 80),
  
  // RGBA variations - Generated from master color
  shadow: rgbToRgba(MASTER_RGB.r, MASTER_RGB.g, MASTER_RGB.b, 0.3),
  overlay: rgbToRgba(MASTER_RGB.r, MASTER_RGB.g, MASTER_RGB.b, 0.1),
  
  // Hover states - Generated from master color
  hover: rgbToHex(MASTER_RGB.r + 20, MASTER_RGB.g + 20, MASTER_RGB.b + 20),
  hoverLight: rgbToHex(MASTER_RGB.r + 40, MASTER_RGB.g + 40, MASTER_RGB.b + 40),
  
  // Selection and interactive states - Generated from master color
  selected: rgbToHex(MASTER_RGB.r + 100, MASTER_RGB.g + 100, MASTER_RGB.b + 100), // Very light version for selections
  selectedBackground: rgbToRgba(MASTER_RGB.r, MASTER_RGB.g, MASTER_RGB.b, 0.05), // Very light background for selections
  selectedLightGray: '#f5f5f5', // Light gray for template selection buttons
  
  // UI element colors - Generated from master color
  uiBackground: rgbToHex(MASTER_RGB.r + 60, MASTER_RGB.g + 60, MASTER_RGB.b + 60), // For UI elements like buttons
  uiBackgroundLight: rgbToHex(MASTER_RGB.r + 90, MASTER_RGB.g + 90, MASTER_RGB.b + 90), // Lighter UI elements
};

// ============================================================================
// END GLOBAL COLOR SYSTEM
// ============================================================================ 