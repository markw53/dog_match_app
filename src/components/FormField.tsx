// src/components/FormField.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface FormFieldProps extends TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  helpText?: string;
  icon?: string;
  type?: "text" | "password";
  maxLength?: number;
  onIconPress?: () => void;
}

export default function FormField({
  label,
  value,
  onChangeText,
  error,
  required,
  helpText,
  icon,
  type = "text",
  maxLength,
  onIconPress,
  multiline,
  ...props
}: FormFieldProps) {
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <View style={{ marginBottom: spacing.md }}>
      {/* Label + Max Length Counter */}
      {label && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: spacing.xs,
          }}
        >
          <Text
            style={{
              fontSize: fontSize.md,
              fontWeight: fontWeight.medium as any,
              color: colors.text.primary,
            }}
          >
            {label}
            {required && (
              <Text style={{ color: colors.error, fontWeight: "bold" }}> *</Text>
            )}
          </Text>
          {maxLength && (
            <Text
              style={{
                fontSize: fontSize.sm,
                color: colors.text.secondary,
              }}
            >
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      )}

      {/* Input Container */}
      <View style={{ position: "relative", justifyContent: "center" }}>
        {/* Left Icon */}
        {icon && (
          <TouchableOpacity
            style={{
              position: "absolute",
              left: spacing.md,
              zIndex: 1,
            }}
            onPress={onIconPress}
            disabled={!onIconPress}
          >
            <Ionicons
              name={icon as any}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          style={[
            {
              flex: 1,
              minHeight: multiline ? 100 : 50,
              borderWidth: 1,
              borderColor: error
                ? colors.error
                : focused
                ? colors.primary
                : colors.border,
              borderRadius: radius.md,
              paddingHorizontal: icon ? spacing.xl + 12 : spacing.md,
              paddingTop: multiline ? spacing.md : 0,
              fontSize: fontSize.md,
              color: colors.text.primary,
              backgroundColor: colors.surface,
              textAlignVertical: multiline ? "top" : "center",
            },
          ]}
          multiline={multiline}
          {...props}
        />

        {/* Password eye toggle */}
        {isPassword && (
          <TouchableOpacity
            style={{
              position: "absolute",
              right: spacing.md,
              zIndex: 1,
            }}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Help / Error Messages */}
      {helpText && !error && (
        <Text
          style={{
            fontSize: fontSize.sm,
            color: colors.text.secondary,
            marginTop: spacing.xs,
          }}
        >
          {helpText}
        </Text>
      )}
      {error && (
        <Text
          style={{
            fontSize: fontSize.sm,
            color: colors.error,
            marginTop: spacing.xs,
            fontWeight: fontWeight.medium as any,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}