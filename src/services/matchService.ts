// src/services/matchService.ts
import { db } from "@/config/firebase";
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
import { MATCH_STATUS } from "@/utils/constants";
import { Dog } from "@/types/dog";
import { mapDog } from "./helpers/validateDog";

// 🔹 TS type from constants
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
  dog1?: Dog;
  dog2?: Dog;
  type?: "sent" | "received";
}

function convertTimestamp(ts: Timestamp | Date | undefined): Date {
  if (!ts) return new Date();
  return ts instanceof Timestamp ? ts.toDate() : ts;
}

export const matchService = {
  // 🔹 Create new match
  async createMatch(dog1Id: string, dog2Id: string, userId: string): Promise<Match> {
    const [dog1Doc, dog2Doc] = await Promise.all([
      getDoc(doc(db, "dogs", dog1Id)),
      getDoc(doc(db, "dogs", dog2Id)),
    ]);

    const dog1 = mapDog(dog1Doc);
    const dog2 = mapDog(dog2Doc);

    if (dog1.ownerId !== userId) {
      throw new Error("Unauthorized to create match with this dog");
    }

    const matchRef = await addDoc(collection(db, "matches"), {
      dog1Id,
      dog2Id,
      dog1OwnerId: dog1.ownerId,
      dog2OwnerId: dog2.ownerId,
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
      dog1OwnerId: dog1.ownerId,
      dog2OwnerId: dog2.ownerId,
      initiatedBy: userId,
      status: MATCH_STATUS.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      dog1,
      dog2,
    };
  },

  // 🔹 Update status
  async updateMatchStatus(matchId: string, userId: string, newStatus: MatchStatus): Promise<Match> {
    const matchRef = doc(db, "matches", matchId);
    const matchDoc = await getDoc(matchRef);

    if (!matchDoc.exists()) throw new Error("Match not found");
    const matchData = matchDoc.data();

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
      id: matchDoc.id,
      ...matchData,
      status: newStatus,
      updatedAt: new Date(),
      lastActivity: new Date(),
    } as Match;
  },

  // 🔹 Delete
  async deleteMatch(matchId: string, userId: string): Promise<boolean> {
    const matchRef = doc(db, "matches", matchId);
    const matchDoc = await getDoc(matchRef);

    if (!matchDoc.exists()) {
      throw new Error("Match not found");
    }

    const matchData = matchDoc.data();

    if (matchData.dog1OwnerId !== userId && matchData.dog2OwnerId !== userId) {
      throw new Error("Unauthorized to delete this match");
    }

    await deleteDoc(matchRef);
    return true;
  },

  // 🔹 Get matches for user
  async getUserMatches(userId: string, options: { status?: MatchStatus; lastDoc?: QueryDocumentSnapshot; limitCount?: number } = {}) {
    const { status, lastDoc, limitCount = 10 } = options;

    let baseQuery = query(
      collection(db, "matches"),
      where("status", "!=", MATCH_STATUS.DELETED),
      orderBy("status"),
      orderBy("lastActivity", "desc"),
      limit(limitCount)
    );

    if (status) baseQuery = query(baseQuery, where("status", "==", status));
    if (lastDoc) baseQuery = query(baseQuery, startAfter(lastDoc));

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

  // 🔹 Detailed match (with both dogs validated)
  async getMatchDetails(matchId: string): Promise<Match> {
    const matchDoc = await getDoc(doc(db, "matches", matchId));
    if (!matchDoc.exists()) throw new Error("Match not found");
    const matchData = matchDoc.data();

    const [dog1Doc, dog2Doc] = await Promise.all([
      getDoc(doc(db, "dogs", matchData.dog1Id)),
      getDoc(doc(db, "dogs", matchData.dog2Id)),
    ]);

    const dog1 = mapDog(dog1Doc);
    const dog2 = mapDog(dog2Doc);

    return {
      id: matchDoc.id,
      ...matchData,
      dog1,
      dog2,
      createdAt: convertTimestamp(matchData.createdAt),
      updatedAt: convertTimestamp(matchData.updatedAt),
      lastActivity: convertTimestamp(matchData.lastActivity),
      respondedAt: convertTimestamp(matchData.respondedAt),
    } as Match;
  },
};