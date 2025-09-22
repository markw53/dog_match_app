export const CHAT_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 500,
  MESSAGE_TYPES: {
    TEXT: "text",
    IMAGE: "image",
    LOCATION: "location",
    SYSTEM: "system",
  },
  MESSAGE_STATUS: {
    SENT: "sent",
    DELIVERED: "delivered",
    READ: "read",
    FAILED: "failed",
  },
} as const;