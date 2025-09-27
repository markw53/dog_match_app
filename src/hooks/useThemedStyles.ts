// src/hooks/useThemedStyles.ts
import { useMemo } from "react";
import { StyleSheet, ImageStyle, TextStyle, ViewStyle } from "react-native";
import { useTheme } from "@/context/ThemeContext"; // adjust path!

// 🔹 All possible RN styles
export type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

// 🔹 Type of the Theme (from your ThemeContext)
import type { Theme } from "@/context/ThemeContext"; // <-- make sure ThemeContext exports its Theme type

/**
 * Hook that lets you create styles that are aware of the current theme.
 *
 * @param styleCreator - a function that gets the Theme and returns typed styles
 * @returns Themed & memoized StyleSheet
 */
export function useThemedStyles<T extends NamedStyles<T>>(
  styleCreator: (theme: Theme) => T
): T {
  const theme = useTheme();

  return useMemo(() => {
    const styles = styleCreator(theme);
    return StyleSheet.create(styles);
  }, [theme, styleCreator]);
}