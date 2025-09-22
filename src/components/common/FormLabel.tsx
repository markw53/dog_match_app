// src/components/common/FormLabel.tsx
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface FormLabelProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
}

const FormLabel: React.FC<FormLabelProps> = ({
  label,
  required,
  error,
  description,
}) => {
  const { colors, spacing, fontSize, fontWeight } = useTheme();

  return (
    <View style={{ marginBottom: spacing.xs }}>
      {/* Label Row */}
      <Text
        style={{
          fontSize: fontSize.md,
          fontWeight: fontWeight.medium as any,
          color: error ? colors.error : colors.text.primary,
        }}
      >
        {label}
        {required && (
          <Text style={{ color: colors.error, fontWeight: "bold" }}> *</Text>
        )}
      </Text>

      {/* Optional description (helper text) */}
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

      {/* Error message */}
      {error && (
        <Text
          style={{
            marginTop: spacing.xs,
            fontSize: fontSize.sm,
            color: colors.error,
            fontWeight: fontWeight.regular as any,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

export default FormLabel;