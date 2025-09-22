// src/components/User/HelpSection.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import Card from "../common/Card";

interface HelpSectionProps {
  onHelpCenter: () => void;
  onTerms: () => void;
  onPrivacyPolicy: () => void;
}

export const HelpSection: React.FC<HelpSectionProps> = ({
  onHelpCenter,
  onTerms,
  onPrivacyPolicy,
}) => {
  const { colors, fontSize, fontWeight, spacing } = useTheme();

  const items = [
    { label: "Help Center", icon: "help-circle-outline", onPress: onHelpCenter },
    { label: "Terms & Conditions", icon: "document-text-outline", onPress: onTerms },
    { label: "Privacy Policy", icon: "shield-outline", onPress: onPrivacyPolicy },
  ];

  return (
    <Card variant="flat" padding>
      {items.map((item, i) => (
        <TouchableOpacity
          key={i}
          onPress={item.onPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: spacing.sm,
            borderBottomWidth: i < items.length - 1 ? 1 : 0,
            borderBottomColor: colors.border,
          }}
        >
          <Ionicons
            name={item.icon as any}
            size={20}
            color={colors.text.secondary}
            style={{ marginRight: spacing.md }}
          />
          <Text
            style={{
              fontSize: fontSize.md,
              fontWeight: fontWeight.medium as any,
              color: colors.text.primary,
            }}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Card>
  );
};