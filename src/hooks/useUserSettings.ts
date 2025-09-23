import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

interface UserSettings {
  notifications?: boolean;
  emailUpdates?: boolean;
  darkMode?: boolean;
  [key: string]: any;
}

export const useUserSettings = (userId?: string) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Listen to Firestore in real time
  useEffect(() => {
    if (!userId) return;

    const ref = doc(db, "users", userId, "meta", "settings");
    setLoading(true);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as UserSettings);
          setError(null);
        } else {
          // if no doc yet, fallback to defaults
          setSettings({
            notifications: true,
            emailUpdates: true,
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Settings load error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [userId]);

  // 🔹 Update settings partially
  const updateSettings = useCallback(
    async (key: string, value: any) => {
      if (!userId) return;
      try {
        const ref = doc(db, "users", userId, "meta", "settings");
        await updateDoc(ref, { [key]: value });
        setSettings((prev) => ({
          ...prev,
          [key]: value,
        }));
      } catch (err: any) {
        console.error("Failed updating user settings:", err);
        throw err;
      }
    },
    [userId]
  );

  return {
    settings,
    loading,
    error,
    updateSettings,
  };
};