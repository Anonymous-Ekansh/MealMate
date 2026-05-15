/**
 * MealMate - Color Palette & Design Tokens
 */

export const Colors = {
  // Primary palette
  saffron: "#F4A024",
  cream: "#FFF8F0",
  charcoal: "#1C1C1E",
  mint: "#E8F5E9",
  chiliRed: "#D32F2F",
  masalaBrown: "#795548",

  // Semantic colors
  primary: "#F4A024",
  primaryLight: "#FBBF4E",
  primaryDark: "#D48A1C",
  background: "#FFF8F0",
  surface: "#FFFFFF",
  text: "#1C1C1E",
  textSecondary: "#6B6B6D",
  textLight: "#9E9E9E",
  success: "#4CAF50",
  successLight: "#E8F5E9",
  error: "#D32F2F",
  errorLight: "#FFEBEE",
  warning: "#FF9800",
  warningLight: "#FFF3E0",

  // UI Colors
  border: "#E8E0D8",
  borderLight: "#F0EBE5",
  shadow: "rgba(28, 28, 30, 0.08)",
  shadowDark: "rgba(28, 28, 30, 0.16)",
  overlay: "rgba(28, 28, 30, 0.5)",
  white: "#FFFFFF",
  black: "#000000",

  // Gradient
  gradientStart: "#F4A024",
  gradientEnd: "#FBBF4E",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  huge: 34,
};

export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  heavy: "800" as const,
};
