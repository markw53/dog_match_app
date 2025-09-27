// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { lightTheme, darkTheme, Theme } from "./themeDefinitions"; // import from your refactored theme file

interface ThemeContextProps {
  theme: Theme;
  colorScheme: ColorSchemeName;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = Appearance.getColorScheme(); // "light" | "dark" | null
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(systemColorScheme || "light");

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });
    return () => listener.remove();
  }, []);

  const toggleTheme = () => {
    setColorScheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): Theme => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx.theme;
};

export const useColorSchemeTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useColorSchemeTheme must be used within ThemeProvider");
  return { colorScheme: ctx.colorScheme, toggleTheme: ctx.toggleTheme };
};