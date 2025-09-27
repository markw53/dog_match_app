// src/components/common/EmptyState.tsx
import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { useTheme } from "@/context/ThemeContext";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  const theme = useTheme();
  const styles = useThemedStyles((t) => ({
    container: {
      justifyContent: "center",
      alignItems: "center",
      padding: t.spacing.lg,
      marginTop: t.spacing.xl,
    },
    title: {
      ...t.typography.h2,
      color: t.colors.text.primary,
      marginTop: t.spacing.sm,
      textAlign: "center",
    },
    message: {
      ...t.typography.body2,
      color: t.colors.text.secondary,
      marginTop: t.spacing.xs,
      textAlign: "center",
    },
    icon: {
      marginBottom: t.spacing.sm,
    },
  }));

  return (
    <View style={styles.container}>
      {icon && <Ionicons name={icon as any} size={48} color={theme.colors.text.disabled} />}
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}