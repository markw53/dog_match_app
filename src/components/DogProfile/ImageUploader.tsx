// src/components/DogProfile/ImageUploader.tsx
import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

interface ImageUploaderProps {
  images: string[];
  currentImage?: string;
  onPickImage: () => void;
  onRemoveImage: () => void;
  loading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  currentImage,
  onPickImage,
  onRemoveImage,
  loading = false,
}) => {
  const { colors, radius, spacing, shadows } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.md }]}>
      <TouchableOpacity
        style={[
          styles.imageBox,
          {
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            ...shadows.small,
          },
        ]}
        activeOpacity={0.8}
        onPress={onPickImage}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : currentImage || images.length > 0 ? (
          <Image
            source={{ uri: currentImage || images[0] }}
            style={{
              width: "100%",
              height: 200,
              borderRadius: radius.md,
            }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="camera-outline" size={50} color={colors.text.light} />
        )}
      </TouchableOpacity>

      {(currentImage || images.length > 0) && (
        <TouchableOpacity
          style={{
            marginTop: spacing.sm,
            alignSelf: "center",
            padding: spacing.sm,
          }}
          onPress={onRemoveImage}
        >
          <Ionicons name="trash-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  imageBox: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ImageUploader;