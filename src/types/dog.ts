// src/types/dog.ts
export interface Dog {
  id: string;
  name: string;
  ownerId: string;
  breed?: string;
  gender?: "male" | "female";
  weight?: number;
  height?: number;
  description?: string;
  photoURL?: string;
  healthCertificates?: {
    vaccinations?: boolean;
    healthCheck?: boolean;
  };
}