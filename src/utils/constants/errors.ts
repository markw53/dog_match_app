export const ERRORS = {
  GENERAL: {
    UNKNOWN: {
      code: "general/unknown-error",
      message: "An unknown error occurred",
    },
    NETWORK: {
      code: "general/network-error",
      message: "Network error occurred",
    },
  },
  AUTH: {
    INVALID_CREDENTIALS: {
      code: "auth/invalid-credentials",
      message: "Invalid email or password",
    },
    USER_NOT_FOUND: {
      code: "auth/user-not-found",
      message: "User not found",
    },
  },
  DOG: {
    CREATE_FAILED: {
      code: "dog/create-failed",
      message: "Failed to create dog profile",
    },
  },
} as const;