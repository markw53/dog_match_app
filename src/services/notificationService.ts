// src/services/notificationService.ts
import { db } from "@/config/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  startAfter,
  getDocs,
  doc,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";

// 🔹 Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

// 🔹 Firestore helper: convert timestamp
function convertTimestamp(ts: Timestamp | Date | undefined): Date {
  if (!ts) return new Date();
  return ts instanceof Timestamp ? ts.toDate() : ts;
}

export const notificationService = {
  // Create a new notification for a user
  async createNotification(
    userId: string,
    data: { type: string; message: string; [key: string]: any }
  ): Promise<void> {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        ...data,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },

  // Paginate through user notifications
  async getUserNotifications(
    userId: string,
    lastDoc: QueryDocumentSnapshot | null = null
  ): Promise<PaginatedNotifications> {
    try {
      let q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const notifications: Notification[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId,
          type: data.type,
          message: data.message,
          data: data.data ?? {},
          read: data.read ?? false,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      });

      return {
        notifications,
        lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
        hasMore: snapshot.docs.length === 20,
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  // Mark a single notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // Mark all unread user notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("read", "==", false)
      );

      const snapshot = await getDocs(q);

      snapshot.docs.forEach((docSnap) => {
        batch.update(docSnap.ref, {
          read: true,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },
};