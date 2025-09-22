// src/components/common/Divider.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface DividerProps {
  text?: string;
}

export function Divider({ text }: DividerProps) {
  const { colors, spacing, fontSize, fontWeight } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginVertical: spacing.lg,
      }}
    >
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: colors.border,
        }}
      />
      {text ? (
        <Text
          style={{
            marginHorizontal: spacing.md,
            fontSize: fontSize.sm,
            fontWeight: fontWeight.regular as any,
            color: colors.text.secondary,
          }}
        >
          {text}
        </Text>
      ) : null}
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: colors.border,
        }}
      />
    </View>
  );
}