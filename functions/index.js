const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendOnMessage = functions.firestore
    .document("chats/{chatId}/messages/{messageId}")
    .onCreate(async (snap, context) => {
        const message = snap.data();
        const senderId = message.senderId;
        const chatId = context.params.chatId;

        // Find chat participants
        const chatDoc = await admin.firestore().collection("matches").doc(chatId).get();

        if (!chatDoc.exists) return;
        const users = chatDoc.data().users;
        const receiverId = users.find(u => u !== senderId);

        // Get FCM token of receiver
        const userDoc = await admin.firestore().collection("users").doc(receiverId).get();
        const fcmToken = userDoc.data().fcmToken;

        if (!fcmToken) return;

        // Send push notification
        await admin.messaging().send({
            token: fcmToken,
            notification: {
                title: "New Message",
                body: message.text,
            }
        });
    });