// src/services/userService.ts
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  FirestoreDataConverter,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { UserDoc } from "@/utils/constants/firestoreModels";

// 🔹 Firestore Data Converter for UserDoc
const userConverter: FirestoreDataConverter<UserDoc> = {
  toFirestore: (user: UserDoc) => {
    return {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL || null,
      role: user.role || "user",
      subscriptionPlan: user.subscriptionPlan || "free",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // add lastSeen, notificationToken if you track those
    };
  },
  fromFirestore: (snapshot, options) => {
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
    } as UserDoc;
  },
};

// src/services/userService.ts
export const userService = {
  // 🔹 Get user profile
  async getUserProfile(userId: string) {
    const ref = doc(db, "users", userId).withConverter(userConverter);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data()! : null;
  },

  // 🔹 Update profile
  async updateUserProfile(userId: string, updates: Partial<UserDoc>) {
    const ref = doc(db, "users", userId).withConverter(userConverter);
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date(),
    } as Partial<UserDoc>);
  },

  // 🔹 Create or overwrite user (e.g. on signup)
  async setUserProfile(user: UserDoc) {
    const ref = doc(db, "users", user.uid).withConverter(userConverter);
    await setDoc(ref, user, { merge: true });
  },
};