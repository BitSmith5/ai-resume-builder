import { createTheme, Theme } from '@mui/material/styles';

// ============================================================================
// MATERIAL UI THEME SYSTEM - Replaces the color system
// ============================================================================

// Master color in RGB format for IDE color picker support
const MASTER_COLOR_RGB = { r: 173, g: 126, b: 233 };

// Helper functions for color generation
const rgbToHex = (r: number, g: number, b: number): string => {
  const clampedR = Math.max(0, Math.min(255, Math.round(r)));
  const clampedG = Math.max(0, Math.min(255, Math.round(g)));
  const clampedB = Math.max(0, Math.min(255, Math.round(b)));
  return `#${((1 << 24) + (clampedR << 16) + (clampedG << 8) + clampedB).toString(16).slice(1)}`;
};

const rgbToRgba = (r: number, g: number, b: number, alpha: number): string => {
  const clampedR = Math.max(0, Math.min(255, Math.round(r)));
  const clampedG = Math.max(0, Math.min(255, Math.round(g)));
  const clampedB = Math.max(0, Math.min(255, Math.round(b)));
  return `rgba(${clampedR}, ${clampedG}, ${clampedB}, ${alpha})`;
};

// Generate color palette dynamically from master color
const primaryColor = rgbToHex(MASTER_COLOR_RGB.r, MASTER_COLOR_RGB.g, MASTER_COLOR_RGB.b);
const primaryLight = rgbToHex(MASTER_COLOR_RGB.r + 30, MASTER_COLOR_RGB.g + 30, MASTER_COLOR_RGB.b + 30);
const primaryDark = rgbToHex(MASTER_COLOR_RGB.r - 30, MASTER_COLOR_RGB.g - 30, MASTER_COLOR_RGB.b - 30);
const background = rgbToHex(MASTER_COLOR_RGB.r + 50, MASTER_COLOR_RGB.g + 50, MASTER_COLOR_RGB.b + 50);
const backgroundLight = rgbToHex(MASTER_COLOR_RGB.r + 80, MASTER_COLOR_RGB.g + 80, MASTER_COLOR_RGB.b + 80);
const shadow = rgbToRgba(MASTER_COLOR_RGB.r, MASTER_COLOR_RGB.g, MASTER_COLOR_RGB.b, 0.3);
const overlay = rgbToRgba(MASTER_COLOR_RGB.r, MASTER_COLOR_RGB.g, MASTER_COLOR_RGB.b, 0.1);
const hover = rgbToHex(MASTER_COLOR_RGB.r + 20, MASTER_COLOR_RGB.g + 20, MASTER_COLOR_RGB.b + 20);
const hoverLight = rgbToHex(MASTER_COLOR_RGB.r + 40, MASTER_COLOR_RGB.g + 40, MASTER_COLOR_RGB.b + 40);
const selected = rgbToHex(MASTER_COLOR_RGB.r + 100, MASTER_COLOR_RGB.g + 100, MASTER_COLOR_RGB.b + 100);
const selectedBackground = rgbToRgba(MASTER_COLOR_RGB.r, MASTER_COLOR_RGB.g, MASTER_COLOR_RGB.b, 0.05);
const uiBackground = rgbToHex(MASTER_COLOR_RGB.r + 60, MASTER_COLOR_RGB.g + 60, MASTER_COLOR_RGB.b + 60);
const uiBackgroundLight = rgbToHex(MASTER_COLOR_RGB.r + 90, MASTER_COLOR_RGB.g + 90, MASTER_COLOR_RGB.b + 90);

// Define theme colors before theme creation so they can be used in component overrides
const themeColors = {
  primary: primaryColor,
  primaryLight,
  primaryDark,
  background,
  backgroundLight,
  shadow,
  overlay,
  hover,
  hoverLight,
  selected,
  selectedBackground,
  uiBackground,
  uiBackgroundLight,
  selectedLightGray: '#f5f5f5',
  
  // Gray palette for consistent usage
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',  // Main background
    200: '#eeeeee',
    300: '#e0e0e0',  // Borders
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    A100: '#d5d5d5',
    A200: '#aaaaaa',
    A400: '#a0a0a0', // Icons and subtle elements
    A700: '#666666', // Secondary text
  },
  
  // Common gray usage patterns
  backgroundGray: '#f5f5f5',    // Main background color
  borderGray: '#e0e0e0',        // Border color
  iconGray: '#a0a0a0',          // Icon color
  textGray: '#666666',           // Secondary text
  white: '#ffffff',              // Pure white
};

// Create the Material UI theme
export const theme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primaryColor,
      light: primaryLight,
      dark: primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: hover,
      light: hoverLight,
      dark: primaryDark,
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5', // Very light gray for main backgrounds
      paper: '#ffffff',   // White for cards and elevated surfaces
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    grey: {
      50: '#fafafa',   // Lightest gray
      100: '#f5f5f5',  // Very light gray (main background)
      200: '#eeeeee',  // Light gray
      300: '#e0e0e0',  // Light gray (borders)
      400: '#bdbdbd',  // Medium light gray
      500: '#9e9e9e',  // Medium gray
      600: '#757575',   // Medium dark gray
      700: '#616161',   // Dark gray
      800: '#424242',   // Very dark gray
      900: '#212121',   // Darkest gray
      A100: '#d5d5d5', // Custom light gray
      A200: '#aaaaaa', // Custom medium gray
      A400: '#a0a0a0', // Custom medium gray (used in your codebase)
      A700: '#666666', // Custom dark gray (used in your codebase)
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#2e7d32',
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: hover,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: primaryColor,
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'transparent',
          },
          '&.Mui-checked': {
            color: primaryColor,
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          '& .MuiFormControlLabel-label': {
            color: '#666666',
          },
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#e0e0e0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${themeColors.borderGray}`,
          backgroundColor: themeColors.backgroundGray,
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: themeColors.white,
          border: `1px solid ${themeColors.borderGray}`,
          '&:hover': {
            backgroundColor: themeColors.selectedBackground,
            border: `1px solid ${themeColors.borderGray}`,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: themeColors.white,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: `1px solid ${themeColors.hover}`,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: `1px solid ${themeColors.primary}`,
          },
        },
      },
    },
  },
});

// ============================================================================
// THEME UTILITIES - For components that need direct color access
// ============================================================================

// Export color values for components that need them directly
export { themeColors };

// Export the master color for backward compatibility
export const MASTER_COLOR_RGBA = `rgb(${MASTER_COLOR_RGB.r}, ${MASTER_COLOR_RGB.g}, ${MASTER_COLOR_RGB.b})`;

// ============================================================================
// END MATERIAL UI THEME SYSTEM
// ============================================================================
