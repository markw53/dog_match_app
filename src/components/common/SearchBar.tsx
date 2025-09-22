// src/components/common/SearchBar.tsx
import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onSubmit,
  onClear,
}: SearchBarProps) {
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.background,
          borderRadius: radius.md,
          paddingHorizontal: spacing.sm,
          height: 42,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* 🔍 Search Icon */}
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.text.secondary}
          style={{ marginRight: spacing.xs }}
        />

        {/* 📝 Text Input */}
        <TextInput
          style={{
            flex: 1,
            fontSize: fontSize.md,
            color: colors.text.primary,
            fontWeight: fontWeight.regular as any,
            paddingVertical: Platform.OS === "ios" ? spacing.sm : spacing.xs,
          }}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.text.light}
          returnKeyType="search"
          clearButtonMode="while-editing" // works only on iOS
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* ❌ Clear Button (Android support) */}
        {value.length > 0 && Platform.OS === "android" && (
          <TouchableOpacity
            onPress={() => {
              onChangeText("");
              onClear?.();
            }}
            style={{ padding: spacing.xs }}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}