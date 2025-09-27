// src/services/matchService.ts
import { db } from "@/config/firebaseConfig";
import {
  collection,
  doc,
  addDoc,
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
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { MATCH_STATUS, COLLECTIONS } from "@/utils/constants";

// ---- Types ----
export type MatchStatus = typeof MATCH_STATUS[keyof typeof MATCH_STATUS];

export interface Match {
  id: string;
  dog1Id: string;
  dog2Id: string;
  dog1OwnerId: string;
  dog2OwnerId: string;
  initiatedBy: string;
  status: MatchStatus;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  respondedAt?: Date;
  respondedBy?: string;
  type?: "sent" | "received"; // for UI convenience
}

export interface MatchWithDogs extends Match {
  dog1?: any; // You can replace with Dog type if imported
  dog2?: any;
}

function convertTimestamp(ts: Timestamp | Date | undefined): Date {
  if (!ts) return new Date();
  return ts instanceof Timestamp ? ts.toDate() : ts;
}

// ---- Service ----
export const matchService = {
  // 🔹 Create a new match
  async createMatch(dog1Id: string, dog2Id: string, userId: string): Promise<MatchWithDogs> {
    // Fetch both dogs
    const [dog1Snap, dog2Snap] = await Promise.all([
      getDoc(doc(db, COLLECTIONS.DOGS, dog1Id)),
      getDoc(doc(db, COLLECTIONS.DOGS, dog2Id)),
    ]);

    if (!dog1Snap.exists() || !dog2Snap.exists()) {
      throw new Error("One or both dogs not found");
    }

    const dog1Data = dog1Snap.data();
    const dog2Data = dog2Snap.data();

    if (!dog1Data?.ownerId || dog1Data.ownerId !== userId) {
      throw new Error("Unauthorized to create match with this dog");
    }

    const matchRef = await addDoc(collection(db, COLLECTIONS.MATCHES), {
      dog1Id,
      dog2Id,
      dog1OwnerId: dog1Data.ownerId,
      dog2OwnerId: dog2Data.ownerId,
      initiatedBy: userId,
      status: MATCH_STATUS.PENDING,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
    });

    return {
      id: matchRef.id,
      dog1Id,
      dog2Id,
      dog1OwnerId: dog1Data.ownerId,
      dog2OwnerId: dog2Data.ownerId,
      initiatedBy: userId,
      status: MATCH_STATUS.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      dog1: { id: dog1Id, ...dog1Data },
      dog2: { id: dog2Id, ...dog2Data },
    };
  },

  // 🔹 Update match status (typically accept/reject)
  async updateMatchStatus(matchId: string, userId: string, newStatus: MatchStatus): Promise<Match> {
    const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);
    const matchSnap = await getDoc(matchRef);
    if (!matchSnap.exists()) throw new Error("Match not found");

    const matchData = matchSnap.data();
    if (matchData.dog2OwnerId !== userId) {
      throw new Error("Unauthorized to update this match");
    }

    await updateDoc(matchRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
      respondedAt: serverTimestamp(),
      respondedBy: userId,
    });

    return {
      id: matchId,
      ...matchData,
      status: newStatus,
      updatedAt: new Date(),
      lastActivity: new Date(),
    } as Match;
  },

  // 🔹 Delete a match
  async deleteMatch(matchId: string, userId: string): Promise<boolean> {
    const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);
    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) throw new Error("Match not found");

    const matchData = matchSnap.data();
    if (matchData.dog1OwnerId !== userId && matchData.dog2OwnerId !== userId) {
      throw new Error("Unauthorized to delete match");
    }

    await deleteDoc(matchRef);
    return true;
  },

  // 🔹 Get user matches (sent + received)
  async getUserMatches(
    userId: string,
    options: { status?: MatchStatus; lastDoc?: QueryDocumentSnapshot; limitCount?: number } = {}
  ): Promise<{ matches: Match[]; lastDoc: QueryDocumentSnapshot | null; hasMore: boolean }> {
    const { status, lastDoc, limitCount = 10 } = options;

    // Better: use "in" queries to filter out deleted
    const allowedStatuses: MatchStatus[] = Object.values(MATCH_STATUS).filter((s) => s !== MATCH_STATUS.DELETED);

    let baseQuery = query(
      collection(db, COLLECTIONS.MATCHES),
      orderBy("lastActivity", "desc"),
      limit(limitCount)
    );

    if (status) {
      baseQuery = query(baseQuery, where("status", "==", status));
    } else {
      baseQuery = query(baseQuery, where("status", "in", allowedStatuses));
    }
    if (lastDoc) {
      baseQuery = query(baseQuery, startAfter(lastDoc));
    }

    const [sent, received] = await Promise.all([
      getDocs(query(baseQuery, where("dog1OwnerId", "==", userId))),
      getDocs(query(baseQuery, where("dog2OwnerId", "==", userId))),
    ]);

    const formatMatch = (docSnap: QueryDocumentSnapshot, type: "sent" | "received"): Match => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        type,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        lastActivity: convertTimestamp(data.lastActivity),
        respondedAt: convertTimestamp(data.respondedAt),
      } as Match;
    };

    const matches = [
      ...sent.docs.map((d) => formatMatch(d, "sent")),
      ...received.docs.map((d) => formatMatch(d, "received")),
    ].sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

    return {
      matches,
      lastDoc: matches.length > 0 ? sent.docs[sent.docs.length - 1] : null,
      hasMore: matches.length === limitCount,
    };
  },

  // 🔹 Get full details of a match (with dogs)
  async getMatchDetails(matchId: string): Promise<MatchWithDogs> {
    const matchSnap = await getDoc(doc(db, COLLECTIONS.MATCHES, matchId));
    if (!matchSnap.exists()) throw new Error("Match not found");

    const matchData = matchSnap.data();
    const [dog1Snap, dog2Snap] = await Promise.all([
      getDoc(doc(db, COLLECTIONS.DOGS, matchData.dog1Id)),
      getDoc(doc(db, COLLECTIONS.DOGS, matchData.dog2Id)),
    ]);

    return {
      id: matchSnap.id,
      ...matchData,
      dog1: dog1Snap.exists() ? { id: dog1Snap.id, ...dog1Snap.data() } : undefined,
      dog2: dog2Snap.exists() ? { id: dog2Snap.id, ...dog2Snap.data() } : undefined,
      createdAt: convertTimestamp(matchData.createdAt),
      updatedAt: convertTimestamp(matchData.updatedAt),
      lastActivity: convertTimestamp(matchData.lastActivity),
      respondedAt: convertTimestamp(matchData.respondedAt),
    } as MatchWithDogs;
  },
};