// src/config/firebase.ts

import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  initializeFirestore,
  CACHE_SIZE_UNLIMITED 
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from "@env";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

// --- Initialize Firebase ---
const app: FirebaseApp = initializeApp(firebaseConfig);

// Firestore with optional extra settings
const db: Firestore = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true,
});

// Storage
const storage: FirebaseStorage = getStorage(app);

// Functions in different regions
const functionsUS: Functions = getFunctions(app, 'us-central1');
const functionsUK: Functions = getFunctions(app, 'europe-west2');
const functionsEU: Functions = getFunctions(app, 'europe-west1');
const functionsSG: Functions = getFunctions(app, 'asia-southeast1');

// --- Utils / Helpers ---
export const getFunctionsByRegion = (region: string): Functions => {
  switch (region) {
    case 'us-central1': return functionsUS;
    case 'europe-west2': return functionsUK;
    case 'europe-west1': return functionsEU;
    case 'asia-southeast1': return functionsSG;
    default: return functionsUK;
  }
};

// Example action code settings (update to your real domains & package ids)
export const actionCodeSettings = {
  url: 'https://your-app-domain.com/verify-email',
  iOS: { bundleId: 'your.app.bundle.id' },
  android: {
    packageName: 'your.app.package',
    installApp: true,
    minimumVersion: '12'
  },
  handleCodeInApp: true,
};

// --- Optional Configs for Reference ---
export const firestoreConfig = {
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  merge: true,
};

export const storageConfig = {
  maxUploadRetryTime: 10000,
  maxOperationRetryTime: 10000,
  maxDownloadRetryTime: 10000,
};

export const batchConfig = {
  maxOperations: 500, // Firestore batch limit
};

export const queryConfig = {
  defaultPageSize: 20,
  maxPageSize: 100,
  defaultOrderBy: 'createdAt',
  defaultOrderDirection: 'desc' as 'asc' | 'desc',
};

// --- Exports ---
export { app, db, storage, functionsUS, functionsUK, functionsEU, functionsSG };