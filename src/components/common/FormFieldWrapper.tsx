// src/components/common/FormFieldWrapper.tsx
import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface FormFieldWrapperProps {
  label?: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode; // the actual input element
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  label,
  required,
  error,
  description,
  children,
}) => {
  const { colors, spacing, fontSize, fontWeight } = useTheme();

  return (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Label */}
      {label && (
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.medium as any,
            color: error ? colors.error : colors.text.primary,
            marginBottom: spacing.xs,
          }}
        >
          {label}
          {required && (
            <Text style={{ fontWeight: "bold", color: colors.error }}> *</Text>
          )}
        </Text>
      )}

      {/* Description/helper text */}
      {description && (
        <Text
          style={{
            fontSize: fontSize.sm,
            color: colors.text.secondary,
            marginBottom: spacing.xs,
          }}
        >
          {description}
        </Text>
      )}

      {/* Input control */}
      <View>{children}</View>

      {/* Error (always below input) */}
      {error && (
        <Text
          style={{
            fontSize: fontSize.sm,
            marginTop: spacing.xs,
            color: colors.error,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

export default FormFieldWrapper;