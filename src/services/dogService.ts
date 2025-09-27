// src/services/dogService.ts
import { db, storage } from "@/config/firebaseConfig";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  writeBatch,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { DOG_BREEDS } from "@/utils/constants";
import { calculateDistance } from "@/utils";

export interface DogImage {
  url: string;
  path: string;
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age?: number;
  gender?: "male" | "female";
  description?: string;
  location?: { latitude: number; longitude: number };
  ownerId?: string;
  images?: DogImage[];
  isAvailableForMating?: boolean;
  views?: number;
  likes?: number;
  matches?: number;
  createdAt?: Date;
  updatedAt?: Date;
  distance?: number; // from getNearbyDogs
}

interface PaginationResult<T> {
  dogs: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export const dogService = {
  // 🔹 Create Dog
  async createDog(dogData: Omit<Dog, "id">, images: { uri: string }[] = []): Promise<Dog> {
    try {
      if (!DOG_BREEDS.includes(dogData.breed)) {
        throw new Error("Invalid breed selected");
      }

      const imageUrls: DogImage[] = await Promise.all(
        images.map(async (image) => {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          const filename = `dogs/${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}`;
          const storageRef = ref(storage, filename);
          await uploadBytes(storageRef, blob);
          return { url: await getDownloadURL(storageRef), path: filename };
        })
      );

      const docRef = await addDoc(collection(db, "dogs"), {
        ...dogData,
        images: imageUrls,
        isAvailableForMating: true,
        views: 0,
        likes: 0,
        matches: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { id: docRef.id, ...dogData, images: imageUrls };
    } catch (error) {
      console.error("Error creating dog:", error);
      throw error;
    }
  },

  // 🔹 Update
  async updateDog(
    dogId: string,
    updates: Partial<Dog>,
    newImages: { uri: string }[] = [],
    deletedImages: DogImage[] = []
  ): Promise<Dog> {
    try {
      const dogRef = doc(db, "dogs", dogId);
      const dogSnap = await getDoc(dogRef);

      if (!dogSnap.exists()) throw new Error("Dog not found");

      const currentDog = dogSnap.data() as Dog;
      let updatedImages = [...(currentDog.images || [])];

      // Delete removed
      if (deletedImages.length > 0) {
        await Promise.all(
          deletedImages.map(async (image) => {
            if (image.path) {
              const imageRef = ref(storage, image.path);
              await deleteObject(imageRef);
            }
          })
        );
        updatedImages = updatedImages.filter(
          (img) => !deletedImages.find((del) => del.url === img.url)
        );
      }

      // Add new
      if (newImages.length > 0) {
        const newImageUrls: DogImage[] = await Promise.all(
          newImages.map(async (image) => {
            const response = await fetch(image.uri);
            const blob = await response.blob();
            const filename = `dogs/${Date.now()}-${Math.random()
              .toString(36)
              .substring(7)}`;
            const storageRef = ref(storage, filename);
            await uploadBytes(storageRef, blob);
            return { url: await getDownloadURL(storageRef), path: filename };
          })
        );
        updatedImages = [...updatedImages, ...newImageUrls];
      }

      await updateDoc(dogRef, {
        ...updates,
        images: updatedImages,
        updatedAt: serverTimestamp(),
      });

      return { id: dogId, ...updates, images: updatedImages } as Dog;
    } catch (error) {
      console.error("Error updating dog:", error);
      throw error;
    }
  },

  // 🔹 Get Dog
  async getDog(dogId: string): Promise<Dog> {
    try {
      const docSnap = await getDoc(doc(db, "dogs", dogId));
      if (!docSnap.exists()) throw new Error("Dog not found");

      await updateDoc(doc(db, "dogs", dogId), { views: increment(1) });

      return { id: docSnap.id, ...(docSnap.data() as Dog) };
    } catch (error) {
      console.error("Error retrieving dog:", error);
      throw error;
    }
  },

  // 🔹 Nearby Dogs
  async getNearbyDogs(
    location: { latitude: number; longitude: number },
    options: { radius?: number; lastDoc?: QueryDocumentSnapshot; itemsPerPage?: number } = {}
  ): Promise<PaginationResult<Dog>> {
    const { radius = 50, lastDoc = null, itemsPerPage = 20 } = options;

    try {
      let dogsQuery = query(
        collection(db, "dogs"),
        where("isAvailableForMating", "==", true),
        orderBy("createdAt", "desc"),
        limit(itemsPerPage)
      );

      if (lastDoc) {
        dogsQuery = query(dogsQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(dogsQuery);
      const dogs: Dog[] = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data() as Dog;
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            data.location?.latitude ?? 0,
            data.location?.longitude ?? 0
          );
          return { id: docSnap.id, ...data, distance };
        })
        .filter((dog) => dog.distance! <= radius);

      return {
        dogs,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === itemsPerPage,
      };
    } catch (error) {
      console.error("Error fetching nearby dogs:", error);
      throw error;
    }
  },

  // 🔹 Delete Dog
  async deleteDog(dogId: string): Promise<boolean> {
    try {
      const dogRef = doc(db, "dogs", dogId);
      const dogSnap = await getDoc(dogRef);

      if (!dogSnap.exists()) throw new Error("Dog not found");

      const dogData = dogSnap.data() as Dog;

      if (dogData.images?.length) {
        await Promise.all(
          dogData.images.map(async (image: DogImage) => {
            if (image.path) {
              const imageRef = ref(storage, image.path);
              await deleteObject(imageRef);
            }
          })
        );
      }

      await deleteDoc(dogRef);

      // Delete associated matches
      const matchesQuery = query(collection(db, "matches"), where("dogId", "==", dogId));
      const matchesSnapshot = await getDocs(matchesQuery);

      const batch = writeBatch(db);
      matchesSnapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();

      return true;
    } catch (error) {
      console.error("Error deleting dog:", error);
      throw error;
    }
  },

  // 🔹 Toggle Like
  async toggleLike(dogId: string, userId: string): Promise<boolean> {
    try {
      const likeRef = doc(db, "likes", `${dogId}_${userId}`);
      const likeDoc = await getDoc(likeRef);

      if (likeDoc.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(doc(db, "dogs", dogId), { likes: increment(-1) });
        return false;
      } else {
        await setDoc(likeRef, {
          dogId,
          userId,
          createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, "dogs", dogId), { likes: increment(1) });
        return true;
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  },
};