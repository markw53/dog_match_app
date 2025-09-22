export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/jpg"],
  COMPRESSION_QUALITY: 0.8,
  ASPECT_RATIO: [4, 3],
} as const;