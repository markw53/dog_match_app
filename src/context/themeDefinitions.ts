import { typography } from "@/utils/fonts";

/**
 * 🔹 Theme Interface
 */
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    round: number; // for circular FAB/avatar buttons
  };
  typography: typeof typography; // reuse from fonts.ts
  shadows: {
    small: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    large: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

/**
 * 🔹 Common Tokens
 */
const spacing: Theme["spacing"] = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

const radius: Theme["radius"] = {
  sm: 6,
  md: 12,
  lg: 20,
  round: 999,
};

const shadows: Theme["shadows"] = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
};

/**
 * 🔹 Light Theme
 */
export const lightTheme: Theme = {
  colors: {
    primary: "#3498db",
    secondary: "#9b59b6",
    success: "#2ecc71",
    warning: "#f39c12",
    error: "#e74c3c",
    background: "#ffffff",
    surface: "#f5f5f5",
    text: {
      primary: "#222222",
      secondary: "#555555",
      disabled: "#aaaaaa",
    },
  },
  spacing,
  radius,
  typography,
  shadows,
};

/**
 * 🔹 Dark Theme
 */
export const darkTheme: Theme = {
  colors: {
    primary: "#2980b9",
    secondary: "#8e44ad",
    success: "#27ae60",
    warning: "#e67e22",
    error: "#c0392b",
    background: "#121212",
    surface: "#1e1e1e",
    text: {
      primary: "#f5f5f5",
      secondary: "#cccccc",
      disabled: "#777777",
    },
  },
  spacing,
  radius,
  typography,
  shadows,
};