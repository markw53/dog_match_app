import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();
const db = admin.firestore();

/**
 * Types
 */
interface DogDoc {
  dogId: string;
  name: string;
  ownerId: string;
  breed?: string;
  gender?: "male" | "female";
  weight?: number;
  photoURL?: string;
  description?: string;
}

interface MatchDoc {
  participants: string[];
  dog1Id: string;
  dog2Id: string;
  dog1OwnerId: string;
  dog2OwnerId: string;
  createdAt: FirebaseFirestore.Timestamp | admin.firestore.FieldValue;
  updatedAt: FirebaseFirestore.Timestamp | admin.firestore.FieldValue;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "completed" | "expired" | "deleted";
  active: boolean;
}

/**
 * Expo Push helper
 */
async function sendExpoPush(to: string, title: string, body: string, data: any = {}) {
  if (!to) return;
  try {
    await axios.post("https://exp.host/--/api/v2/push/send", {
      to,
      sound: "default",
      title,
      body,
      data,
    });
  } catch (err) {
    console.error("❌ Failed to send push notification:", err);
  }
}

/**
 * Trigger whenever a like is added into dogSwipes/{dogId}
 */
export const handleNewLike = functions.firestore
  .document("dogSwipes/{dogId}")
  .onUpdate(async (change, context) => {
    const dogId = context.params.dogId;

    const beforeLikes: string[] = change.before.data()?.likes || [];
    const afterLikes: string[] = change.after.data()?.likes || [];

    // Which dog was newly liked?
    const newLikes = afterLikes.filter((id) => !beforeLikes.includes(id));
    if (newLikes.length === 0) return null;

    for (const likedDogId of newLikes) {
      console.log(`🐾 ${dogId} liked ${likedDogId}`);

      // Check if likedDog already liked this dog back
      const likedDogSwipeRef = db.collection("dogSwipes").doc(likedDogId);
      const likedDogSnap = await likedDogSwipeRef.get();

      if (
        likedDogSnap.exists &&
        (likedDogSnap.data()?.likes || []).includes(dogId)
      ) {
        console.log(`💘 Mutual match: ${dogId} & ${likedDogId}`);

        // Load both dogs
        const dogDocRef = await db.collectionGroup("dogs").where("dogId", "==", dogId).limit(1).get();
        const likedDogDocRef = await db.collectionGroup("dogs").where("dogId", "==", likedDogId).limit(1).get();

        if (dogDocRef.empty || likedDogDocRef.empty) {
          console.log("❌ Dogs not found, skipping match creation");
          return null;
        }

        const dog = dogDocRef.docs[0].data() as DogDoc;
        const likedDog = likedDogDocRef.docs[0].data() as DogDoc;

        // Guard required fields
        if (!dog.ownerId || !dog.name || !likedDog.ownerId || !likedDog.name) {
          console.log("❌ One of the dogs is missing name or ownerId. Skipping.");
          return null;
        }

        // Prevent duplicate matches
        const existingMatches = await db
          .collection("matches")
          .where("participants", "in", [
            [dogId, likedDogId],
            [likedDogId, dogId],
          ])
          .get();

        if (!existingMatches.empty) {
          console.log("⚠️ Match already exists between these dogs");
          return null;
        }

        // Create new match
        const newMatch: MatchDoc = {
          participants: [dogId, likedDogId],
          dog1Id: dogId,
          dog2Id: likedDogId,
          dog1OwnerId: dog.ownerId,
          dog2OwnerId: likedDog.ownerId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "pending",
          active: true,
        };

        const matchRef = await db.collection("matches").add(newMatch);

        console.log("✅ Match created!", matchRef.id);

        // 🔹 Notify both owners
        const [owner1Snap, owner2Snap] = await Promise.all([
          db.collection("users").doc(dog.ownerId).get(),
          db.collection("users").doc(likedDog.ownerId).get(),
        ]);

        // Notify owner 1
        if (owner1Snap.exists) {
          const owner1Data = owner1Snap.data();
          if (owner1Data?.pushToken) {
            await sendExpoPush(
              owner1Data.pushToken,
              "🎉 It’s a Match!",
              `Your dog ${dog.name} matched with ${likedDog.name}!`,
              { matchId: matchRef.id }
            );
          }
        }

        // Notify owner 2
        if (owner2Snap.exists) {
          const owner2Data = owner2Snap.data();
          if (owner2Data?.pushToken) {
            await sendExpoPush(
              owner2Data.pushToken,
              "🎉 It’s a Match!",
              `Your dog ${likedDog.name} matched with ${dog.name}!`,
              { matchId: matchRef.id }
            );
          }
        }
      }
    }

    return null;
  });