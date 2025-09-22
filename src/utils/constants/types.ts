// src/utils/constants/types.ts

// 🐶 Dogs
import type {
  DOG_BREEDS,
  TEMPERAMENTS,
  DOG_COLORS,
  AGE_RANGES,
  WEIGHT_CATEGORIES,
} from "./dogs";

// 👤 Auth
import type { USER_ROLES } from "./auth";

// 🤝 Matches
import type { MATCH_STATUS, NOTIFICATION_TYPES } from "./matches";

// 💬 Chat
import type { CHAT_CONSTANTS } from "./chat";

// ❤️ Health
import type { HEALTH_STATUS, VACCINATION_TYPES } from "./health";

// ========== DOGS ==========
export type DogBreed = typeof DOG_BREEDS[number];
export type Temperament = typeof TEMPERAMENTS[number];
export type DogColor = typeof DOG_COLORS[number];
export type AgeRange = typeof AGE_RANGES[number]; // {label,min,max}
export type WeightCategory = typeof WEIGHT_CATEGORIES[number]; // {label,min,max}

// ========== AUTH ==========
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// ========== MATCHES ==========
export type MatchStatus = typeof MATCH_STATUS[keyof typeof MATCH_STATUS];
export type NotificationType =
  typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// ========== CHAT ==========
export type MessageType =
  typeof CHAT_CONSTANTS.MESSAGE_TYPES[keyof typeof CHAT_CONSTANTS.MESSAGE_TYPES];

export type MessageStatus =
  typeof CHAT_CONSTANTS.MESSAGE_STATUS[keyof typeof CHAT_CONSTANTS.MESSAGE_STATUS];

// ========== HEALTH ==========
export type HealthStatus =
  typeof HEALTH_STATUS[keyof typeof HEALTH_STATUS];
export type VaccinationType = typeof VACCINATION_TYPES[number];