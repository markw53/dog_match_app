// src/components/User/ProfileHeader.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import Card from "../common/Card";

interface ProfileHeaderProps {
  profile: {
    displayName?: string;
    email?: string;
    photoURL?: string;
  } | null;
  onImagePress: () => void;
  onEditPress: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onImagePress,
  onEditPress,
}) => {
  const { colors, spacing, fontSize, fontWeight, radius } = useTheme();

  return (
    <Card variant="elevated" padding>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Avatar */}
        <TouchableOpacity
          onPress={onImagePress}
          style={{
            width: 80,
            height: 80,
            borderRadius: radius.round,
            overflow: "hidden",
            backgroundColor: colors.border,
            marginRight: spacing.md,
          }}
        >
          <Image
            source={
              profile?.photoURL
                ? { uri: profile.photoURL }
                : require("../../assets/default-avatar.png")
            }
            style={{ width: "100%", height: "100%" }}
          />
        </TouchableOpacity>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.bold as any,
              color: colors.text.primary,
            }}
          >
            {profile?.displayName || "User"}
          </Text>
          <Text
            style={{
              fontSize: fontSize.sm,
              color: colors.text.secondary,
              marginTop: spacing.xs,
            }}
          >
            {profile?.email}
          </Text>
        </View>

        {/* Edit Button */}
        <TouchableOpacity onPress={onEditPress}>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
};