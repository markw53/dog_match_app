// src/hooks/useImagePicker.ts
import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";

export interface PickedImage {
  uri: string;
  width?: number;
  height?: number;
  fileName?: string;
  fileSize?: number;
  type?: string;
}

type ErrorMessage = string | null;

export const useImagePicker = () => {
  const [images, setImages] = useState<PickedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorMessage>(null);

  // 🔹 Map raw asset → PickedImage
  const normalizeAsset = (asset: ImagePicker.ImagePickerAsset): PickedImage => ({
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    fileName: asset.fileName ?? undefined, // normalize null → undefined
    fileSize: asset.fileSize ?? undefined, // normalize null → undefined
    type: asset.type ?? undefined,         // normalize null → undefined
  });

  // 🔹 Pick an image from gallery
  const pickImage = useCallback(
    async (options?: Partial<ImagePicker.ImagePickerOptions>) => {
      try {
        setLoading(true);
        setError(null);

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          ...options,
        });

        if (!result.canceled && result.assets.length > 0) {
          const picked = normalizeAsset(result.assets[0]);
          setImages((prev) => [...prev, picked]);
          return picked;
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 🔹 Take a photo with camera
  const takePhoto = useCallback(
    async (options?: Partial<ImagePicker.ImagePickerOptions>) => {
      try {
        setLoading(true);
        setError(null);

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          ...options,
        });

        if (!result.canceled && result.assets.length > 0) {
          const picked = normalizeAsset(result.assets[0]);
          setImages((prev) => [...prev, picked]);
          return picked;
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 🔹 Remove a specific image
  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // 🔹 Clear all images
  const clearImages = useCallback(() => {
    setImages([]);
    setError(null);
  }, []);

  return {
    images,
    loading,
    error,
    pickImage,
    takePhoto,
    removeImage,
    clearImages,
  };
};