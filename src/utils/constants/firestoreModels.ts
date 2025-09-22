// src/utils/constants/firestoreModels.ts
import type {
  DogBreed,
  DogColor,
  Temperament,
  AgeRange,
  WeightCategory,
  UserRole,
  MatchStatus,
  NotificationType,
  MessageType,
  MessageStatus,
  HealthStatus,
  VaccinationType,
} from "./types";

// =============== USER DOCUMENT ===============
export interface UserDoc {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole; // "user", "admin", etc.
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlan?: "free" | "premium" | "professional";
}

// =============== DOG DOCUMENT ===============
export interface DogDoc {
  id: string;
  ownerId: string; // users/{uid}
  name: string;
  breed: DogBreed;
  color?: DogColor;
  temperament?: Temperament;
  age?: number;
  ageRange?: AgeRange;
  weightCategory?: WeightCategory;
  description?: string;
  isAvailableForMating?: boolean;
  healthCertificates?: HealthStatus[];
  vaccinations?: VaccinationType[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// =============== MATCH DOCUMENT ===============
export interface MatchDoc {
  id: string;
  dog1Id: string;
  dog2Id: string;
  dog1Owner: string;
  dog2Owner: string;
  participants: string[]; // [dog1Id, dog2Id]
  status: MatchStatus; // "pending" | "accepted" | ...
  createdAt: Date;
  updatedAt: Date;
}

// =============== NOTIFICATION DOCUMENT ===============
export interface NotificationDoc {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
}

// =============== CHAT DOCUMENTS ===============
export interface ChatDoc {
  id: string;
  matchId: string; // link to MatchDoc
  participants: string[]; // dog owner UIDs
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
}

export interface MessageDoc {
  id: string;
  chatId: string; // parent ChatDoc
  senderId: string;
  type: MessageType; // "text" | "image" | ...
  status: MessageStatus; // "sent" | "delivered" | ...
  text?: string;
  imageUrl?: string;
  location?: { lat: number; lng: number };
  createdAt: Date;
}

// =============== HEALTH RECORD DOCUMENT ===============
export interface HealthRecordDoc {
  id: string;
  dogId: string;
  recordType: HealthStatus | VaccinationType;
  description?: string;
  issuedBy?: string;
  issuedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
}