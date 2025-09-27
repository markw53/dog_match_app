// src/components/common/Card.tsx
import React from "react";
import { View, StyleProp, ViewStyle, TouchableOpacity } from "react-native";
import { useThemedStyles } from "@/hooks/useThemedStyles";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: "elevated" | "outlined" | "filled";
}

export default function Card({ children, style, onPress, variant = "elevated" }: CardProps) {
  const styles = useThemedStyles((t) => ({
    container: {
      backgroundColor: variant === "filled" ? t.colors.primary : t.colors.surface,
      borderRadius: t.radius.md,
      padding: t.spacing.md,
      borderWidth: variant === "outlined" ? 1 : 0,
      borderColor: variant === "outlined" ? t.colors.text.disabled : "transparent",
      shadowColor: "#000",
      shadowOpacity: variant === "elevated" ? 0.1 : 0,
      shadowRadius: variant === "elevated" ? 4 : 0,
      elevation: variant === "elevated" ? 3 : 0,
      marginBottom: t.spacing.md,
    },
  }));

  if (onPress) {
    return (
      <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.container, style]}>{children}</View>;
}