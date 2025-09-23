// src/components/common/ConfirmationDialog.tsx
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "default" | "danger" | "success";
  icon?: string;
}

export default function ConfirmationDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default",
  icon,
}: ConfirmationDialogProps) {
  const { colors, radius, spacing, fontSize, fontWeight, shadows } = useTheme();

  // Dynamic colors by type
  const typeColors = (() => {
    switch (type) {
      case "danger":
        return { icon: colors.error, button: colors.error };
      case "success":
        return { icon: colors.success, button: colors.success };
      default:
        return { icon: colors.primary, button: colors.primary };
    }
  })();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: spacing.lg,
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                width: width * 0.9,
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                padding: spacing.lg,
                ...shadows.medium,
              }}
            >
              {/* Optional Icon */}
              {icon && (
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "center",
                    marginBottom: spacing.md,
                    backgroundColor: typeColors.icon + "20",
                  }}
                >
                  <Ionicons name={icon as any} size={32} color={typeColors.icon} />
                </View>
              )}

              {/* Title */}
              <Text
                style={{
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.semibold as any,
                  color: colors.text.primary,
                  textAlign: "center",
                  marginBottom: spacing.sm,
                }}
              >
                {title}
              </Text>

              {/* Message */}
              <Text
                style={{
                  fontSize: fontSize.md,
                  color: colors.text.secondary,
                  textAlign: "center",
                  marginBottom: spacing.lg,
                  lineHeight: 20,
                }}
              >
                {message}
              </Text>

              {/* Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: spacing.sm,
                }}
              >
                {/* Cancel */}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: colors.background,
                    alignItems: "center",
                  }}
                  onPress={onCancel}
                >
                  <Text
                    style={{
                      fontSize: fontSize.md,
                      fontWeight: fontWeight.semibold as any,
                      color: colors.text.secondary,
                    }}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                {/* Confirm */}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: typeColors.button,
                    alignItems: "center",
                  }}
                  onPress={onConfirm}
                >
                  <Text
                    style={{
                      fontSize: fontSize.md,
                      fontWeight: fontWeight.semibold as any,
                      color: colors.white,
                    }}
                  >
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}