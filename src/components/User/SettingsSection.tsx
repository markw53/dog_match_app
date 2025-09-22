// src/components/User/SettingsSection.tsx
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import Card from "../common/Card";

interface SettingsSectionProps {
  settings: {
    notifications?: boolean;
    darkMode?: boolean;
  } | null;
  onSettingChange: (key: string, value: any) => void;
  onPasswordChange: () => void;
  onPrivacySettings: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  settings,
  onSettingChange,
  onPasswordChange,
  onPrivacySettings,
}) => {
  const { colors, spacing, fontSize, fontWeight, radius } = useTheme();

  const items = [
    {
      label: "Notifications",
      value: settings?.notifications ?? true,
      key: "notifications",
      icon: "notifications-outline",
    },
    {
      label: "Dark Mode",
      value: settings?.darkMode ?? false,
      key: "darkMode",
      icon: "moon-outline",
    },
  ];

  return (
    <Card variant="flat" padding>
      {/* Options */}
      {items.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: spacing.sm,
            borderBottomWidth: i < items.length - 1 ? 1 : 0,
            borderBottomColor: colors.border,
          }}
          onPress={() => onSettingChange(item.key, !item.value)}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={item.icon as any}
              size={20}
              color={colors.text.secondary}
              style={{ marginRight: spacing.sm }}
            />
            <Text
              style={{
                fontSize: fontSize.md,
                color: colors.text.primary,
                fontWeight: fontWeight.medium as any,
              }}
            >
              {item.label}
            </Text>
          </View>
          <Ionicons
            name={item.value ? "checkmark-circle" : "ellipse-outline"}
            size={20}
            color={item.value ? colors.primary : colors.text.secondary}
          />
        </TouchableOpacity>
      ))}

      {/* Password + Privacy Settings */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing.sm,
        }}
        onPress={onPasswordChange}
      >
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={colors.text.secondary}
          style={{ marginRight: spacing.sm }}
        />
        <Text style={{ color: colors.text.primary, fontSize: fontSize.md }}>
          Change Password
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing.sm,
        }}
        onPress={onPrivacySettings}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={20}
          color={colors.text.secondary}
          style={{ marginRight: spacing.sm }}
        />
        <Text style={{ color: colors.text.primary, fontSize: fontSize.md }}>
          Privacy Settings
        </Text>
      </TouchableOpacity>
    </Card>
  );
};