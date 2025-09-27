// src/screens/SettingsScreen.tsx
import React from "react";
import { View, Text, Switch } from "react-native";
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { useTheme, useColorSchemeTheme } from "@/context/ThemeContext";

export default function SettingsScreen() {
  const theme = useTheme();
  const { colorScheme, toggleTheme } = useColorSchemeTheme();

  const styles = useThemedStyles((t) => ({
    container: {
      flex: 1,
      backgroundColor: t.colors.background,
      padding: t.spacing.lg,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: t.spacing.md,
    },
    label: {
      ...t.typography.body1,
      color: t.colors.text.primary,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch
          value={colorScheme === "dark"}
          onValueChange={toggleTheme}
          trackColor={{ false: theme.colors.text.disabled, true: theme.colors.primary }}
          thumbColor={colorScheme === "dark" ? theme.colors.primary : "#f4f3f4"}
        />
      </View>
    </View>
  );
}