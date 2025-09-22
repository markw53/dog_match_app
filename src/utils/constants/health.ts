export const VACCINATION_TYPES = [
  "Rabies",
  "Distemper",
  "Parvovirus",
  "Leptospirosis",
] as const;

export const HEALTH_CERTIFICATES = [
  "General Health Check",
  "Hip Dysplasia",
  "DNA Test",
  "Breeding Certification",
] as const;

export const HEALTH_STATUS = {
  VACCINATED: "vaccinated",
  DEWORMED: "dewormed",
  SPAYED_NEUTERED: "spayed_neutered",
  MICROCHIPPED: "microchipped",
} as const;

export const DOG_REGISTRATION = {
  TYPES: {
    AKC: "American Kennel Club",
    CKC: "Canadian Kennel Club",
    UKC: "United Kennel Club",
    FCI: "Fédération Cynologique Internationale",
  },
  STATUS: {
    PENDING: "pending",
    VERIFIED: "verified",
    REJECTED: "rejected",
  },
} as const;