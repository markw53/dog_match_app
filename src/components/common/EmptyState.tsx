// src/components/common/EmptyState.tsx
import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "alert-circle-outline",
  title,
  message,
}) => {
  const { colors, spacing, fontSize, fontWeight } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.lg,
        minHeight: 280,
      }}
    >
      {/* Icon */}
      <Ionicons
        name={icon as any}
        size={64}
        color={colors.text.light}
        style={{ marginBottom: spacing.md }}
      />

      {/* Title */}
      <Text
        style={{
          fontSize: fontSize.xl,
          fontWeight: fontWeight.semibold as any,
          color: colors.text.primary,
          marginBottom: spacing.sm,
          textAlign: "center",
        }}
      >
        {title}
      </Text>

      {/* Message */}
      <Text
        style={{
          fontSize: fontSize.md,
          color: colors.text.secondary,
          textAlign: "center",
          maxWidth: "80%",
        }}
      >
        {message}
      </Text>
    </View>
  );
};

export default EmptyState;