// src/screens/ChatScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

interface ChatScreenProps {
  route: { params: { matchId: string } };
}

export default function ChatScreen({ route }: ChatScreenProps) {
  const { matchId } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();

  const [messages, setMessages] = useState<IMessage[]>([]);

  // Listen to Firestore messages in real-time
  useEffect(() => {
    const messagesRef = collection(db, "matches", matchId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: IMessage[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          _id: docSnap.id,
          text: data.text,
          createdAt: data.createdAt?.toDate() || new Date(),
          user: {
            _id: data.senderId,
            name: data.senderName || "Dog Owner",
            avatar: data.senderAvatar || undefined,
          },
        };
      });
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [matchId]);

  // Send message
  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const { _id, createdAt, text, user: msgUser } = newMessages[0];
      const messagesRef = collection(db, "matches", matchId, "messages");

      await addDoc(messagesRef, {
        text,
        createdAt: serverTimestamp(),
        senderId: user?.uid,
        senderName: user?.displayName || user?.email,
        senderAvatar: user?.photoURL || null,
      });
    },
    [matchId, user]
  );

  return (
    <GiftedChat
      messages={messages}
      onSend={(msgs) => onSend(msgs)}
      user={{
        _id: user?.uid || "anon",
        name: user?.displayName || "Me",
        avatar: user?.photoURL || undefined,
      }}
      placeholder="Type a message..."
      textInputProps={{ style: { color: colors.text.primary } }}
      renderUsernameOnMessage
      renderAvatarOnTop
    />
  );
}