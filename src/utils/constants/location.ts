export const LOCATION_CONSTANTS = {
  DEFAULT_RADIUS: 50, // km
  MIN_RADIUS: 1,
  MAX_RADIUS: 100,
  UPDATE_INTERVAL: 5 * 60 * 1000,
  DISTANCE_FILTER: 100, // meters
  ACCURACY: {
    HIGH: "high",
    BALANCED: "balanced",
    LOW: "low",
    PASSIVE: "passive",
  },
  GEOCODING_LANGUAGE: "en",
  MAX_RESULTS: 20,
} as const;