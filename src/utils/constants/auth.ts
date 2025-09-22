export const AUTH_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 32,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
  USERNAME_PATTERN: /^[a-zA-Z0-9_-]+$/,
} as const;

export const USER_ROLES = {
  USER: "user",
  PREMIUM: "premium",
  ADMIN: "admin",
  MODERATOR: "moderator",
  VETERINARIAN: "veterinarian",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];