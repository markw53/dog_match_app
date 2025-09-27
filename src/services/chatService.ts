// src/services/chatService.ts
import { db } from "@/config/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
  DocumentData,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "./notificationService";

export interface ChatMessage {
  id: string;
  text: string;
  createdAt: Date;
  senderId: string;
  senderName?: string;
  senderAvatar?: string | null;
}

export const chatService = {
  /**
   * Subscribe to real-time chat messages for a match
   */
  subscribeToChatMessages(
    matchId: string,
    callback: (messages: ChatMessage[]) => void
  ): Unsubscribe {
    const messagesRef = collection(db, "matches", matchId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          text: data.text,
          createdAt: data.createdAt?.toDate() ?? new Date(),
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
        };
      });
      callback(msgs);
    });
  },

  /**
   * Send a message to a match conversation
   */
  async sendMessage(
    matchId: string,
    text: string,
    user: { uid: string; displayName?: string | null; photoURL?: string | null }
  ) {
    if (!user.uid) throw new Error("User not authenticated");

    const messagesRef = collection(db, "matches", matchId, "messages");
    await addDoc(messagesRef, {
      text,
      createdAt: serverTimestamp(),
      senderId: user.uid,
      senderName: user.displayName || "Dog Owner",
      senderAvatar: user.photoURL || null,
      
    });await addDoc(messagesRef, {
      text,
      createdAt: serverTimestamp(),
      senderId: user.uid,
      senderName: user.displayName || "Dog Owner",
      senderAvatar: user.photoURL || null,
    });
            // Optional: local push notification to alert user
    await notificationService.sendLocalNotification({
      title: `New Message from ${user.displayName ?? "Dog Owner"}`,
      body: text.length > 50 ? text.slice(0, 50) + "..." : text,
      data: { matchId },
    });
  },
};