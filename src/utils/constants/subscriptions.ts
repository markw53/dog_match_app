export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    maxDogs: 2,
    features: ["Basic matching", "Limited messages"],
  },
  PREMIUM: {
    id: "premium",
    name: "Premium",
    maxDogs: 5,
    features: ["Unlimited matching", "Unlimited messages", "Advanced filters"],
  },
  PROFESSIONAL: {
    id: "professional",
    name: "Professional",
    maxDogs: 10,
    features: [
      "All Premium features",
      "Health tracking",
      "Priority support",
    ],
  },
} as const;