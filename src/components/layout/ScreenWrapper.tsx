// src/components/layout/ScreenWrapper.tsx
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;   // Allow scrolling if true
  style?: object;         // Custom container style
  contentStyle?: object;  // Custom inner style
  safe?: boolean;         // Wrap in SafeArea? (default true)
  padding?: boolean;      // Apply default padding? (default true)
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  style,
  contentStyle,
  safe = true,
  padding = true,
}) => {
  const { colors, spacing, isDark } = useTheme();

  const Container = safe ? SafeAreaView : View;

  const content = scrollable ? (
    <ScrollView
      style={[styles.scrollView]}
      contentContainerStyle={[
        { flexGrow: 1, padding: padding ? spacing.lg : 0 },
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        { flex: 1, padding: padding ? spacing.lg : 0 },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <Container
      style={[
        styles.base,
        { backgroundColor: colors.background },
        style,
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        translucent={Platform.OS === "android"}
        backgroundColor={colors.background}
      />
      {content}
    </Container>
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

export default ScreenWrapper;