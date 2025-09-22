// src/components/TextFooter.tsx
import React from "react";
import { View, Text, Platform } from "react-native";
import { useTheme } from "@/context/ThemeContext";

const TextFooter = () => {
  const { colors, spacing, fontSize, fontWeight, shadows } = useTheme();

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.sm,
        ...shadows.small,
      }}
    >
      <Text
        style={{
          color: colors.white,
          fontSize: fontSize.sm,
          fontWeight: fontWeight.medium as any,
        }}
      >
        © {new Date().getFullYear()} Waggle, All Rights Reserved.
      </Text>
    </View>
  );
};

export default TextFooter;