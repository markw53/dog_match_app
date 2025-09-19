// src/config/firebaseAuth.ts
import { Platform } from "react-native";
import { app } from "./firebase"; // your firebase.ts config

import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  Auth,
} from "firebase/auth";

import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

let auth: Auth;

if (Platform.OS === "web") {
  // Web / PWA (use local or session persistence)
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence);
} else {
  // iOS & Android (RN persistence via AsyncStorage)
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };