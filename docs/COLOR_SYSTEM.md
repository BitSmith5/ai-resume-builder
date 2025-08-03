# Color System Documentation

## Overview

The color system has been extracted from `ResumeEditorV2.tsx` into a centralized module at `src/lib/colorSystem.ts`. This allows for consistent color management across the entire project.

## Master Color

The system is built around a single master color defined in RGBA format:

```typescript
export const MASTER_COLOR_RGBA = 'rgb(173, 126, 233)'; // Purple color
```

## Available Colors

The `COLORS` object provides a comprehensive palette generated from the master color:

### Primary Colors
- `primary` - Main brand color
- `primaryLight` - Lighter version of primary
- `primaryDark` - Darker version of primary

### Background Colors
- `background` - Main background color
- `backgroundLight` - Lighter background variant

### Interactive States
- `hover` - Hover state color
- `hoverLight` - Light hover variant
- `selected` - Selected state color
- `selectedBackground` - Background for selected items
- `selectedLightGray` - Light gray for selections

### Overlay & Shadow
- `shadow` - Shadow color with 30% opacity
- `overlay` - Overlay color with 10% opacity

### UI Elements
- `uiBackground` - Background for UI elements
- `uiBackgroundLight` - Light UI background

## Usage

### Import the Color System

```typescript
import { COLORS } from '@/lib/colorSystem';
```

### Use in Components

```typescript
// In Material-UI sx prop
<Box sx={{ backgroundColor: COLORS.primary }} />

// In inline styles
<div style={{ color: COLORS.hover }} />

// In styled components
const StyledButton = styled.button`
  background-color: ${COLORS.primary};
  &:hover {
    background-color: ${COLORS.hover};
  }
`;
```

## Utility Functions

The color system also exports utility functions for color manipulation:

### `extractRgbFromString(colorString: string)`
Extracts RGB values from a color string.

### `rgbToHex(r: number, g: number, b: number)`
Converts RGB values to hex color.

### `rgbToRgba(r: number, g: number, b: number, alpha: number)`
Converts RGB values to RGBA color with specified alpha.

## Changing the Master Color

To change the entire color scheme, simply update the `MASTER_COLOR_RGBA` value in `src/lib/colorSystem.ts`. All other colors will be automatically recalculated based on this master color.

## Migration Notes

- `ResumeEditorV2.tsx` has been updated to import colors from the new system
- `ModernResumeTemplate.tsx` now uses `COLORS.primary` instead of its own `MASTER_COLOR`
- `ClassicResumeTemplate.tsx` continues to use its traditional black/white/gray colors

## Benefits

1. **Centralized Management** - All colors defined in one place
2. **Consistency** - Ensures consistent color usage across components
3. **Easy Customization** - Change the master color to update the entire theme
4. **Type Safety** - Full TypeScript support with proper typing
5. **IDE Support** - Colors are defined in IDE-friendly RGBA format 