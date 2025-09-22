// src/components/common/FAB.tsx
import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface FABProps {
  icon: string; // Ionicons icon name
  onPress: (event: GestureResponderEvent) => void;
  color?: string; // optional custom icon color
  backgroundColor?: string; // optional background override
  size?: number; // button size
  style?: ViewStyle | ViewStyle[];
}

const FAB: React.FC<FABProps> = ({
  icon,
  onPress,
  color,
  backgroundColor,
  size = 56,
  style,
}) => {
  const { colors, radius, shadows } = useTheme();

  const iconSize = size * 0.45;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radius.round,
          backgroundColor: backgroundColor ?? colors.primary,
          ...shadows.medium,
        },
        style,
      ]}
    >
      <Ionicons name={icon as any} size={iconSize} color={color ?? colors.white} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    position: "absolute",
    bottom: 20,
    right: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6, // Android elevation
  },
});

export default FAB;