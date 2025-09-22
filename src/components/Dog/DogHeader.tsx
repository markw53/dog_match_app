// src/components/Dog/DogHeader.tsx
import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface DogHeaderProps {
  dog: {
    imageUrl?: string;
  };
  isOwner?: boolean;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function Header({ dog, isOwner, onBack, onEdit, onDelete }: DogHeaderProps) {
  const { colors, spacing, radius, shadows } = useTheme();

  return (
    <View
      style={[
        styles.imageContainer,
        { backgroundColor: colors.surface, ...shadows.medium },
      ]}
    >
      {/* Dog image */}
      <Image
        source={
          dog.imageUrl
            ? { uri: dog.imageUrl }
            : require("../../assets/default-dog.png")
        }
        style={[styles.dogImage, { borderRadius: radius.md }]}
      />

      {/* Back Button */}
      <TouchableOpacity
        style={[
          styles.iconButton,
          {
            top: spacing.lg,
            left: spacing.lg,
            backgroundColor: colors.black + "80", // translucent black bg
          },
        ]}
        onPress={onBack}
      >
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>

      {/* Owner Action Buttons */}
      {isOwner && (
        <View
          style={[
            styles.actionButtons,
            { top: spacing.lg, right: spacing.lg },
          ]}
        >
          {onEdit && (
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={onEdit}
            >
              <Ionicons name="create-outline" size={22} color={colors.white} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: colors.error },
              ]}
              onPress={onDelete}
            >
              <Ionicons name="trash-outline" size={22} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 250,
    overflow: "hidden",
  },
  dogImage: {
    width: "100%",
    height: "100%",
  },
  iconButton: {
    position: "absolute",
    padding: 8,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    position: "absolute",
  },
});