// src/hooks/useUserProfile.ts
import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { UserDoc } from "../utils/constants/firestoreModels";
import { userConverter } from "@/services/firestoreConverters";

export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Subscribe to real-time Firestore document
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    const ref = doc(db, "users", userId).withConverter(userConverter);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data()!);
          setError(null);
        } else {
          setProfile(null);
          setError("User profile not found");
        }
        setLoading(false);
      },
      (err) => {
        console.error("User profile snapshot error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // 🔹 Update profile without reloading entire doc manually
  const updateProfile = useCallback(
    async (updates: Partial<UserDoc>) => {
      if (!userId) return;
      try {
        const ref = doc(db, "users", userId).withConverter(userConverter);
        await updateDoc(ref, {
          ...updates,
          updatedAt: new Date(),
        } as Partial<UserDoc>);
      } catch (err: any) {
        console.error("Failed updating user profile:", err);
        throw err;
      }
    },
    [userId]
  );

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
};