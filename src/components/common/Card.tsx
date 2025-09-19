// src/components/common/Card.tsx
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

type CardVariant = "elevated" | "outlined" | "flat";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariant;
  padding?: boolean;     // apply default padding
  onPress?: () => void;  // Optional clickable
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = "elevated",
  padding = true,
  onPress,
}) => {
  const { colors, spacing, radius, shadows } = useTheme();

  const baseStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  };

  const variantStyle: ViewStyle =
    variant === "outlined"
      ? {
          borderWidth: 1,
          borderColor: colors.border,
        }
      : variant === "elevated"
      ? {
          ...shadows.small,
        }
      : {}; // flat → no shadow or border

  const contentStyle: ViewStyle = padding
    ? { padding: spacing.md }
    : {};

  const card = (
    <View
      style={StyleSheet.flatten([baseStyle, variantStyle, contentStyle, style])}
    >
      {children}
    </View>
  );

  return onPress ? (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{ borderRadius: radius.md }}
    >
      {card}
    </TouchableOpacity>
  ) : (
    card
  );
};

export default Card;