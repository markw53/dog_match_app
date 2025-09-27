// src/types/theme.d.ts
import "styled-components/native";
import { Theme } from "@/context/themeDefinitions";

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}

declare global {
  // Easier usage in your project
  type AppTheme = Theme;
}