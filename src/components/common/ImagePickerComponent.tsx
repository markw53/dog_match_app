// src/components/common/ImagePickerComponent.tsx
import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { IMAGE_CONFIG } from "@/utils/constants";
import { useTheme } from "@/context/ThemeContext";

interface ImagePickerComponentProps {
  value?: string;
  onChange: (uri: string) => void;
  error?: string;
}

export default function ImagePickerComponent({
  value,
  onChange,
  error,
}: ImagePickerComponentProps) {
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();

  const handleImagePick = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Needed",
            "Please grant permission to access your photos"
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [...IMAGE_CONFIG.ASPECT_RATIO] as [number, number],
        quality: IMAGE_CONFIG.COMPRESSION_QUALITY,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const selectedImage = result.assets[0];

        const response = await fetch(selectedImage.uri);
        const blob = await response.blob();

        if (blob.size > IMAGE_CONFIG.MAX_SIZE) {
          Alert.alert(
            "Image Too Large",
            `Please select an image smaller than ${Math.round(
              IMAGE_CONFIG.MAX_SIZE / (1024 * 1024)
            )}MB`
          );
          return;
        }

        onChange(selectedImage.uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  return (
    <View
      style={{
        alignItems: "center",
        marginBottom: spacing.lg,
      }}
    >
      <TouchableOpacity
        onPress={handleImagePick}
        style={{
          width: 200,
          height: 200,
          borderRadius: radius.round,
          overflow: "hidden",
          backgroundColor: colors.background,
          borderWidth: error ? 2 : 0,
          borderColor: error ? colors.error : "transparent",
        }}
      >
        {value ? (
          <Image
            source={{ uri: value }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: colors.border,
              borderStyle: "dashed",
              borderRadius: radius.round,
            }}
          >
            <Ionicons
              name="camera"
              size={40}
              color={colors.text.secondary}
            />
            <Text
              style={{
                marginTop: spacing.sm,
                fontSize: fontSize.md,
                color: colors.text.secondary,
                fontWeight: fontWeight.medium as any,
              }}
            >
              Add Photo
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {error && (
        <Text
          style={{
            color: colors.error,
            fontSize: fontSize.sm,
            marginTop: spacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}