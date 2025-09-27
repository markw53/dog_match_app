import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export const getImageDimensions = (w: number, h: number, maxW: number, maxH: number) => {
  const ratio = Math.min(maxW / w, maxH / h);
  return { width: w * ratio, height: h * ratio };
};

export const compressImage = async (
  uri: string,
  opts: { maxWidth?: number; maxHeight?: number; quality?: number } = { maxWidth: 1024, maxHeight: 1024, quality: 0.8 }
): Promise<string> => {
  try {
    const res = await manipulateAsync(
      uri,
      [{ resize: { width: opts.maxWidth, height: opts.maxHeight } }],
      { compress: opts.quality, format: SaveFormat.JPEG }
    );
    return res.uri;
  } catch (e) {
    console.error("Error compressing image:", e);
    return uri;
  }
};