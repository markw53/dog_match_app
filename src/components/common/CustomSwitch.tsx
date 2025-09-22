// src/components/common/CustomSwitch.tsx
import React from "react";
import { View, Text, Switch } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface CustomSwitchProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  error?: string;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  label,
  description,
  value,
  onValueChange,
  error,
}) => {
  const { colors, fontSize, fontWeight, spacing, radius } = useTheme();

  return (
    <View style={{ marginBottom: spacing.md }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: spacing.sm,
        }}
      >
        {/* Label + Description */}
        <View style={{ flex: 1, marginRight: spacing.md }}>
          <Text
            style={{
              fontSize: fontSize.md,
              fontWeight: fontWeight.medium as any,
              color: colors.text.primary,
            }}
          >
            {label}
          </Text>
          {description && (
            <Text
              style={{
                fontSize: fontSize.sm,
                color: colors.text.secondary,
                marginTop: spacing.xs,
              }}
            >
              {description}
            </Text>
          )}
        </View>

        {/* Switch */}
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={value ? colors.surface : colors.background}
          ios_backgroundColor={colors.border}
        />
      </View>

      {/* Error */}
      {error && (
        <Text
          style={{
            color: colors.error,
            fontSize: fontSize.sm,
            marginTop: spacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

export default CustomSwitch;