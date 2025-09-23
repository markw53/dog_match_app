import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import type { UserDoc } from "../utils/constants/firestoreModels";

export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Load in real-time via Firestore snapshot
  useEffect(() => {
    if (!userId) return;

    const ref = doc(db, "users", userId);
    setLoading(true);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setProfile({ ...(snap.data() as Omit<UserDoc, "uid">), uid: snap.id });
          setError(null);
        } else {
          setProfile(null);
          setError("User not found");
        }
        setLoading(false);
      },
      (err) => {
        console.error("User profile error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [userId]);

  // 🔹 Update profile fields
  const updateProfile = useCallback(
    async (updates: Partial<UserDoc>) => {
      if (!userId) return;
      try {
        const ref = doc(db, "users", userId);
        await updateDoc(ref, updates);
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