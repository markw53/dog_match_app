// src/components/common/SettingsRow.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

interface SettingsRowProps {
  icon: string;              // Ionicons name
  label: string;
  value?: boolean;           // optional (for toggle/check display)
  hasBorder?: boolean;
  onPress?: () => void;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  value,
  hasBorder = true,
  onPress,
}) => {
  const { colors, spacing, fontSize, fontWeight } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing.sm,
        borderBottomWidth: hasBorder ? 1 : 0,
        borderBottomColor: colors.border,
      }}
    >
      {/* Left side: icon + label */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons
          name={icon as any}
          size={20}
          color={colors.text.secondary}
          style={{ marginRight: spacing.md }}
        />
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.medium as any,
            color: colors.text.primary,
          }}
        >
          {label}
        </Text>
      </View>

      {/* Right side: checkmark or > */}
      {value !== undefined ? (
        <Ionicons
          name={value ? "checkmark-circle" : "ellipse-outline"}
          size={20}
          color={value ? colors.primary : colors.text.secondary}
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.text.secondary}
        />
      )}
    </TouchableOpacity>
  );
};