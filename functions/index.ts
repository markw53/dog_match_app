import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

/**
 * Trigger whenever a like is added into dogSwipes/{dogId}
 */
export const handleNewLike = functions.firestore
  .document("dogSwipes/{dogId}")
  .onUpdate(async (change, context) => {
    const dogId = context.params.dogId;
    const beforeLikes: string[] = change.before.data().likes || [];
    const afterLikes: string[] = change.after.data().likes || [];

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

        // Load dog owner info
        const dogDocRef = await db.collectionGroup("dogs").where("dogId", "==", dogId).limit(1).get();
        const likedDogDocRef = await db.collectionGroup("dogs").where("dogId", "==", likedDogId).limit(1).get();

        if (dogDocRef.empty || likedDogDocRef.empty) {
          console.log("❌ Dogs not found, skipping match creation");
          return null;
        }

        const dog = dogDocRef.docs[0].data();
        const likedDog = likedDogDocRef.docs[0].data();

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
        await db.collection("matches").add({
          participants: [dogId, likedDogId],
          dog1Id: dogId,
          dog2Id: likedDogId,
          dog1Owner: dog.ownerId,
          dog2Owner: likedDog.ownerId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          active: true,
        });

        console.log("✅ Match created!");
      }
    }

    return null;
  });