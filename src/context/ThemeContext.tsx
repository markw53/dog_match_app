// src/context/ThemeContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themes } from "../config/theme";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  colors: typeof themes.light.colors;
  shadows: typeof themes.light.shadows;
  spacing: typeof themes.light.spacing;
  radius: typeof themes.light.radius;
  fontSize: typeof themes.light.fontSize;
  fontWeight: typeof themes.light.fontWeight;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemPreference = useColorScheme(); // "light" | "dark" | null

  const getInitialTheme = async (): Promise<ThemeMode> => {
    try {
      const storedTheme = await AsyncStorage.getItem("theme");
      if (storedTheme === "light" || storedTheme === "dark") {
        return storedTheme;
      }
    } catch (e) {
      console.warn("Error reading AsyncStorage theme:", e);
    }
    return systemPreference === "dark" ? "dark" : "light";
  };

  const [theme, setTheme] = useState<ThemeMode>("light");

  // Kick off initial load
  useEffect(() => {
    (async () => {
      const initial = await getInitialTheme();
      setTheme(initial);
    })();
  }, [systemPreference]);

  // Persist changes
  useEffect(() => {
    AsyncStorage.setItem("theme", theme).catch((e) =>
      console.warn("Error saving theme:", e)
    );
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const contextValue: ThemeContextType = {
  theme,
  toggleTheme,
  colors: themes[theme].colors,
  shadows: themes[theme].shadows,
  spacing: themes[theme].spacing,
  radius: themes[theme].radius,
  fontSize: themes[theme].fontSize,
  fontWeight: themes[theme].fontWeight,
  isDark: theme === "dark",
};

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}