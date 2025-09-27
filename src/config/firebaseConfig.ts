// src/config/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  FirestoreSettings,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
  SettableMetadata,
} from "firebase/storage";
import {
  getFunctions,
  Functions,
  connectFunctionsEmulator,
} from "firebase/functions";
// import { getAuth, connectAuthEmulator } from "firebase/auth";

import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from "@env";

/**
 * 🔹 Firebase Base Config
 */
export const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

// 🔹 Initialize App
export const app = initializeApp(firebaseConfig);

// 🔹 Initialize Services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Cloud Functions by region
export const functionsUS = getFunctions(app, "us-central1"); // Iowa
export const functionsUK = getFunctions(app, "europe-west2"); // London
export const functionsEU = getFunctions(app, "europe-west1"); // Belgium
export const functionsSG = getFunctions(app, "asia-southeast1"); // Singapore

/**
 * 🔹 Emulator Connections (dev only)
 */
if (__DEV__) {
  // Uncomment as needed:
  // const auth = getAuth(app);
  // connectAuthEmulator(auth, "http://localhost:9099");

  // connectFirestoreEmulator(db, "localhost", 8080);
  // connectStorageEmulator(storage, "localhost", 9199);
  // connectFunctionsEmulator(functionsUS, "localhost", 5001);
}

/**
 * 🔹 Firestore Config
 */
export const firestoreConfig: FirestoreSettings = {
  cacheSizeBytes: 1048576 * 100, // 100MB
  experimentalForceLongPolling: true,
};

/**
 * 🔹 Storage Config
 */
export const storageConfig: Partial<SettableMetadata> = {
  cacheControl: "public,max-age=3600",
};

/**
 * 🔹 Region Helper
 */
export type FirebaseRegion =
  | "us-central1"
  | "europe-west2"
  | "europe-west1"
  | "asia-southeast1";

export const getFunctionsByRegion = (region: FirebaseRegion): Functions => {
  switch (region) {
    case "us-central1":
      return functionsUS;
    case "europe-west2":
      return functionsUK;
    case "europe-west1":
      return functionsEU;
    case "asia-southeast1":
      return functionsSG;
    default:
      return functionsUK;
  }
};

/**
 * 🔹 Batch Config
 */
export const batchConfig = {
  maxOperations: 500, // Firestore batch limit
};

/**
 * 🔹 Query Defaults
 */
export const queryConfig = {
  defaultPageSize: 20,
  maxPageSize: 100,
  defaultOrderBy: "createdAt",
  defaultOrderDirection: "desc" as const,
};

/**
 * 🔹 Email Action Code Settings (Verification / Password Reset)
 */
export const actionCodeSettings = {
  url: "https://your-app-domain.com/verify-email",
  iOS: { bundleId: "your.app.bundle.id" },
  android: {
    packageName: "your.app.package",
    installApp: true,
    minimumVersion: "12",
  },
  handleCodeInApp: true,
};