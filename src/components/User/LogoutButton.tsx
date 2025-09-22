// src/components/User/LogoutButton.tsx
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import Card from "@/components/common/Card";

interface LogoutButtonProps {
  onPress: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onPress }) => {
  const { colors, fontSize, fontWeight, spacing, radius, shadows } = useTheme();

  return (
    <Card variant="flat" padding>
      <TouchableOpacity
        onPress={onPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: spacing.md,
          backgroundColor: colors.error,
          borderRadius: radius.md,
          ...shadows.small,
        }}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={colors.white}
          style={{ marginRight: spacing.sm }}
        />
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.bold as any,
            color: colors.white,
          }}
        >
          Logout
        </Text>
      </TouchableOpacity>
    </Card>
  );
};