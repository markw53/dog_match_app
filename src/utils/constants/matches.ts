export const MATCH_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export type MatchStatus = typeof MATCH_STATUS[keyof typeof MATCH_STATUS];

export const NOTIFICATION_TYPES = {
  MATCH_REQUEST: "match_request",
  MATCH_ACCEPTED: "match_accepted",
  MATCH_REJECTED: "match_rejected",
  NEW_MESSAGE: "new_message",
  NEARBY_MATCH: "nearby_match",
  HEALTH_REMINDER: "health_reminder",
  SYSTEM_UPDATE: "system_update",
} as const;

export type NotificationType =
  typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];