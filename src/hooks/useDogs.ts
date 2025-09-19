// src/hooks/useDogs.ts
import { useState } from "react";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";

export const useDogs = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const storage = getStorage();

  if (!user) throw new Error("Must be logged in to manage dogs");

  // --- Upload image helper
  const uploadDogImage = async (imageUri: string, dogId: string) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const imageRef = ref(storage, `users/${user.uid}/dogs/${dogId}_${Date.now()}.jpg`);
    await uploadBytes(imageRef, blob);
    return getDownloadURL(imageRef);
  };

  // --- Get single dog profile
  const getDog = async (dogId: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "users", user.uid, "dogs", dogId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // --- Create dog profile
  const createDog = async (dogData: any, images: string[]) => {
    setLoading(true);
    try {
      const colRef = collection(db, "users", user.uid, "dogs");
      const newDocRef = await addDoc(colRef, {
        ...dogData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      let imageUrl = dogData.imageUrl || null;
      if (images && images.length > 0) {
        imageUrl = await uploadDogImage(images[0], newDocRef.id);
        await updateDoc(newDocRef, { imageUrl });
      }

      return newDocRef.id;
    } finally {
      setLoading(false);
    }
  };

  // --- Update existing dog
  const updateDog = async (dogId: string, dogData: any, images: string[]) => {
    setLoading(true);
    try {
      const docRef = doc(db, "users", user.uid, "dogs", dogId);
      let imageUrl = dogData.imageUrl || null;

      if (images && images.length > 0) {
        imageUrl = await uploadDogImage(images[0], dogId);
      }

      await updateDoc(docRef, {
        ...dogData,
        imageUrl,
        updatedAt: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getDog,
    createDog,
    updateDog,
  };
};