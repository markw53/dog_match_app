// src/components/common/Button.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { colors, spacing, radius, fontSize, fontWeight, shadows } = useTheme();

  // --- Variant styles
  const variantStyles = (() => {
    switch (variant) {
      case "primary":
        return {
          container: { backgroundColor: colors.primary, ...shadows.small },
          text: { color: colors.white },
        };
      case "secondary":
        return {
          container: { backgroundColor: colors.secondary, ...shadows.small },
          text: { color: colors.white },
        };
      case "outline":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: colors.primary,
          },
          text: { color: colors.primary },
        };
      case "ghost":
        return {
          container: {
            backgroundColor: "transparent",
          },
          text: { color: colors.primary },
        };
      case "danger":
        return {
          container: { backgroundColor: colors.error, ...shadows.small },
          text: { color: colors.white },
        };
      default:
        return {
          container: { backgroundColor: colors.primary, ...shadows.small },
          text: { color: colors.white },
        };
    }
  })();

  // --- Size styles
  const sizeStyles = (() => {
    switch (size) {
      case "small":
        return {
          container: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: radius.sm,
          },
          text: {
            fontSize: fontSize.sm,
            fontWeight: fontWeight.medium as any,
          },
          icon: 16,
        };
      case "large":
        return {
          container: {
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.xl,
            borderRadius: radius.lg,
          },
          text: {
            fontSize: fontSize.lg,
            fontWeight: fontWeight.medium as any,
          },
          icon: 24,
        };
      default: // medium
        return {
          container: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.md,
          },
          text: {
            fontSize: fontSize.md,
            fontWeight: fontWeight.medium as any,
          },
          icon: 20,
        };
    }
  })();

  // Disabled state
  const containerOpacity = disabled || loading ? 0.6 : 1;

  // --- Render button content
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variantStyles.text.color}
          size="small"
        />
      );
    }

    const iconElement = icon && (
      <Ionicons
        name={icon as any}
        size={sizeStyles.icon}
        color={variantStyles.text.color}
        style={[
          styles.icon,
          iconPosition === "right" && styles.iconRight,
        ]}
      />
    );

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === "left" && iconElement}
        <Text
          style={[
            styles.text,
            sizeStyles.text,
            variantStyles.text,
            textStyle,
          ]}
        >
          {title}
        </Text>
        {icon && iconPosition === "right" && iconElement}
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        sizeStyles.container,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        { opacity: containerOpacity },
        style,
      ]}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
  },
  icon: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
    marginRight: 0,
  },
  fullWidth: {
    width: "100%",
  },
});

export default Button;