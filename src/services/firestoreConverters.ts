// src/services/firestoreConverters.ts
import {
  FirestoreDataConverter,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { UserDoc, DogDoc, MatchDoc } from "../utils/constants/firestoreModels";

// 🔹 User Converter
export const userConverter: FirestoreDataConverter<UserDoc> = {
  toFirestore(user: UserDoc): DocumentData {
    return {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL || null,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan || "free",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      notificationToken: (user as any).notificationToken || null,
      lastSeen: (user as any).lastSeen || null,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): UserDoc {
    const data = snapshot.data(options)!;
    return {
      uid: snapshot.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      role: data.role,
      subscriptionPlan: data.subscriptionPlan,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      lastSeen: data.lastSeen?.toDate?.() || null,
      notificationToken: data.notificationToken || null,
    };
  },
};

// 🔹 Dog Converter
export const dogConverter: FirestoreDataConverter<DogDoc> = {
  toFirestore(dog: DogDoc): DocumentData {
    return {
      ownerId: dog.ownerId,
      name: dog.name,
      breed: dog.breed,
      temperament: dog.temperament || null,
      age: dog.age,
      description: dog.description || "",
      isAvailableForMating: dog.isAvailableForMating || false,
      imageUrl: dog.imageUrl || null,
      createdAt: dog.createdAt,
      updatedAt: dog.updatedAt,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): DogDoc {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      ownerId: data.ownerId,
      name: data.name,
      breed: data.breed,
      temperament: data.temperament,
      age: data.age,
      description: data.description,
      isAvailableForMating: data.isAvailableForMating,
      imageUrl: data.imageUrl,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    };
  },
};

// 🔹 Match Converter
export const matchConverter: FirestoreDataConverter<MatchDoc> = {
  toFirestore(match: MatchDoc): DocumentData {
    return {
      dog1Id: match.dog1Id,
      dog2Id: match.dog2Id,
      dog1Owner: match.dog1Owner,
      dog2Owner: match.dog2Owner,
      participants: match.participants,
      status: match.status,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): MatchDoc {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      dog1Id: data.dog1Id,
      dog2Id: data.dog2Id,
      dog1Owner: data.dog1Owner,
      dog2Owner: data.dog2Owner,
      participants: data.participants,
      status: data.status,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    };
  },
};