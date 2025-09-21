// src/components/common/LoadingOverlay.tsx
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../../context/ThemeContext";

const LoadingOverlay: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {/* Blur background */}
      <BlurView
        intensity={60}
        style={StyleSheet.absoluteFill}
        tint={isDark ? "dark" : "light"}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // ensure it stays above UI
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingOverlay;