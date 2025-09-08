import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();

// --- Function: Send push on new chat messages ---
export const sendOnMessage = functions.firestore
  .document("chats/{chatId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const message = snap.data();
    if (!message) return;

    const senderId = message.senderId;
    const text = message.text || "";
    const chatId = context.params.chatId;

    // The chatId is generated like "uid1-uid2", split to get participants
    const userIds = chatId.split("-");
    const receiverId = userIds[0] === senderId ? userIds[1] : userIds[0];

    // Get receiver user document
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(receiverId)
      .get();
    if (!userDoc.exists) return;

    const fcmToken = userDoc.data()?.fcmToken;
    if (!fcmToken) {
      console.log("❌ No FCM token for receiver");
      return;
    }

    // Send push notification
    const payload = {
      token: fcmToken,
      notification: {
        title: "New Message 🐶",
        body: text,
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        chatId: chatId,
        senderId: senderId,
      },
    };

    await admin.messaging().send(payload);
    console.log(`✅ Push sent to ${receiverId} for message: ${text}`);
  });

// --- Function: Send push on new match created ---
export const sendOnMatch = functions.firestore
  .document("matches/{matchId}")
  .onCreate(async (snap, context) => {
    const match = snap.data();
    if (!match) return;

    const users: string[] = match.users;
    if (!users || users.length < 2) return;

    // Notify both users (skip if they don't have tokens)
    for (const u of users) {
      const userDoc = await admin.firestore().collection("users").doc(u).get();
      if (userDoc.exists) {
        const fcmToken = userDoc.data()?.fcmToken;
        if (fcmToken) {
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: "🎉 It's a Match!",
              body: "You can now chat with your match!",
            },
            data: {
              click_action: "FLUTTER_NOTIFICATION_CLICK",
              matchId: context.params.matchId,
            },
          });
        }
      }
    }

    console.log(`✅ Match notification sent to users: ${users}`);
  });
