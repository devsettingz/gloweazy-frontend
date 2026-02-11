/**
 * Luxury Theme Constants
 * Premium aesthetic for GlowEazy beauty app
 */

// Primary Colors - Rich, sophisticated palette
export const COLORS = {
  // Main brand colors
  primary: '#D4A574',      // Champagne gold
  primaryDark: '#B8935F',  // Darker gold for depth
  primaryLight: '#E8D4B8', // Light gold for backgrounds
  
  // Accent colors
  roseGold: '#E8B4B8',     // Rose gold - feminine luxury
  blush: '#F5E6E0',        // Soft blush pink
  champagne: '#F7E7CE',    // Champagne cream
  
  // Neutral luxury
  cream: '#FAF7F2',        // Rich cream background
  ivory: '#FFFFF0',        // Pure ivory
  pearl: '#F0F0E8',        // Pearl white
  
  // Dark luxury
  charcoal: '#2C2C2C',     // Soft black
  onyx: '#1A1A1A',         // Deep black
  espresso: '#3D2914',     // Rich brown
  
  // Text colors
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',
  textInverse: '#FFFFFF',
  
  // Status colors (muted luxury)
  success: '#7A9E7E',      // Sage green
  error: '#C4706B',        // Dusty rose
  warning: '#D4A574',      // Gold
  info: '#7A9E9E',         // Dusty teal
};

// Typography - Elegant, editorial style
export const TYPOGRAPHY = {
  // Font families (use system fonts with fallbacks)
  serif: 'Georgia, "Times New Roman", serif',
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  
  // Sizes
  hero: 48,
  h1: 36,
  h2: 28,
  h3: 22,
  h4: 18,
  body: 16,
  small: 14,
  caption: 12,
  
  // Weights
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Spacing - Generous, breathable layout
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Shadows - Soft, elevated luxury
export const SHADOWS = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  luxurious: {
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
  },
};

// Border radius - Soft, organic curves
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

// Gradients - Rich color transitions
export const GRADIENTS = {
  gold: ['#F7E7CE', '#D4A574', '#B8935F'],
  rose: ['#F5E6E0', '#E8B4B8', '#D4A574'],
  dark: ['#2C2C2C', '#1A1A1A'],
  light: ['#FFFFFF', '#FAF7F2', '#F5E6E0'],
};

// Animation timings
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  luxurious: 800,
};
