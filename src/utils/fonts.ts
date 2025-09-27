// src/utils/fonts.ts

// 🔹 Available font weights mapped to your custom font family names
export const fonts = {
  regular: "Merienda",
  light: "Merienda-Light",
  medium: "Merienda-Medium",
  bold: "Merienda-Bold",
} as const;

// 🔹 Font sizes (in px)
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// 🔹 Matching line-heights
export const lineHeights = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 36,
  xxxl: 40,
} as const;

// 🔹 Type safety: restrict to literal keys
export type FontWeight = keyof typeof fonts;       // "regular" | "light" | "medium" | "bold"
export type FontSizeKey = keyof typeof fontSizes; // "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl"

// 🔹 Font style object
export interface FontStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
}

// 🔹 Utility to generate font styles
export const getFontStyle = (
  weight: FontWeight = "regular",
  size: FontSizeKey = "md"
): FontStyle => ({
  fontFamily: fonts[weight] ?? fonts.regular,
  fontSize: fontSizes[size] ?? fontSizes.md,
  lineHeight: lineHeights[size] ?? lineHeights.md,
});

// 🔹 Predefined styles for quick usage
export const typography = {
  h1: getFontStyle("bold", "xxxl"),
  h2: getFontStyle("bold", "xxl"),
  h3: getFontStyle("bold", "xl"),
  subtitle1: getFontStyle("medium", "lg"),
  subtitle2: getFontStyle("medium", "md"),
  body1: getFontStyle("regular", "md"),
  body2: getFontStyle("regular", "sm"),
  caption: getFontStyle("light", "sm"),
  button: getFontStyle("medium", "md"),
} as const;