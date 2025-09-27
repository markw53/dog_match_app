// src/components/common/FAB.tsx
import React from "react";
import { TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { useTheme } from "@/context/ThemeContext";

interface FABProps {
  icon: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  size?: number;
  color?: string; // override icon color
}

export default function FAB({ icon, onPress, style, size = 28, color }: FABProps) {
  const theme = useTheme();
  const styles = useThemedStyles((t) => ({
    container: {
      position: "absolute",
      bottom: t.spacing.xxl,
      right: t.spacing.xxl,
      backgroundColor: t.colors.primary,
      width: 56,
      height: 56,
      borderRadius: t.radius.lg,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 6,
    },
  }));

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={icon as any} size={size} color={color ?? "#fff"} />
    </TouchableOpacity>
  );
}