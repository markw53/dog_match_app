// src/config/theme.ts

//
// 🎨 Base Tokens (apply across all themes)
//
export const COLORS = {
  primary: "#BDB76B",
  secondary: "#81b0ff",
  error: "#dc3545",
  success: "#4CAF50",
  warning: "#FFC107",
  white: "#FFFFFF",
  black: "#000000",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  round: 9999,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHTS = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

//
// 🌗 Themes (light + dark)
//
export const themes = {
  light: {
    colors: {
      ...COLORS,
      background: "#F5F5F5",
      surface: "#FFFFFF",
      border: "#DDDDDD",
      text: {
        primary: "#333333",
        secondary: "#666666",
        light: "#999999",
      },
    },
    spacing: SPACING,
    radius: BORDER_RADIUS,
    fontSize: FONT_SIZES,
    fontWeight: FONT_WEIGHTS,
    shadows: SHADOWS,
  },
  dark: {
    colors: {
      ...COLORS,
      background: "#121212",
      surface: "#1E1E1E",
      border: "#333333",
      text: {
        primary: "#FFFFFF",
        secondary: "#AAAAAA",
        light: "#777777",
      },
    },
    spacing: SPACING,
    radius: BORDER_RADIUS,
    fontSize: FONT_SIZES,
    fontWeight: FONT_WEIGHTS,
    shadows: {
      ...SHADOWS,
      small: {
        ...SHADOWS.small,
        shadowOpacity: 0.25,
      },
      medium: {
        ...SHADOWS.medium,
        shadowOpacity: 0.3,
      },
    },
  },
};

//
// 🔑 Type Definition (optional if using TS)
//
export type Theme = typeof themes.light;