// Minimalistic and aesthetic color palette
export const Colors = {
  // Primary colors - Deep blue/purple tones
  primary: "#1A1A2E",
  primaryLight: "#16213E",
  accent: "#0F3460",
  highlight: "#E94560",

  // Neutral colors
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceVariant: "#F0F4F8",

  // Text colors
  textPrimary: "#1A1A2E",
  textSecondary: "#6C757D",
  textLight: "#FFFFFF",
  textMuted: "#ADB5BD",

  // Status colors
  success: "#2ECC71",
  warning: "#F39C12",
  error: "#E74C3C",
  info: "#3498DB",

  // Border colors
  border: "#E9ECEF",
  borderLight: "#DEE2E6",

  // Cluster score colors
  logistics: "#3498DB",
  academic: "#9B59B6",
  financial: "#27AE60",
  campus: "#F39C12",
  reputation: "#E74C3C",
};

export const Typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  fontWeights: {
    regular: "400" as const,
    medium: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Cluster colors for easy reference
export const ClusterColors = {
  logistics: Colors.logistics,
  academic: Colors.academic,
  financial: Colors.financial,
  campus: Colors.campus,
  reputation: Colors.reputation,
};
