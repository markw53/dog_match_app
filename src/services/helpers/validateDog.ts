// src/services/helpers/validateDog.ts
import { Dog } from "@/types/dog";

/**
 * Converts Firestore data into a validated Dog object.
 * Throws if required fields are missing.
 */
export function mapDog(docSnap: any): Dog {
  if (!docSnap.exists()) {
    throw new Error("Dog not found");
  }

  const data = docSnap.data();
  if (!data?.name || !data?.ownerId) {
    throw new Error("Dog data missing required fields");
  }

  return {
    id: docSnap.id,
    name: data.name,
    ownerId: data.ownerId,
    ...data,
  };
}