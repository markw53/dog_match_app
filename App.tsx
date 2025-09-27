// App.tsx
import React from "react";
import RootNavigator from "@/navigation/RootNavigator";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { StatusBar } from "react-native";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <StatusBar barStyle="light-content" /> 
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}