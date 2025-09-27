// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  updateProfile,
  User,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "@/config/firebaseAuth";
import { db } from "@/config/firebase"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_EXPO_CLIENT_ID,
} from "@env";

WebBrowser.maybeCompleteAuthSession();

// 🔹 Context user type
export interface SimpleUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// 🔹 Context value type (used for typing the context itself)
export interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  signup: (email: string, password: string, displayname: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: {
    displayName?: string;
    phoneNumber?: string;
    bio?: string;
    photoURL?: string;
    email?: string;
  }) => Promise<void>;
}

// ✅ FIX: Create context correctly using `AuthContextType`.
// DO NOT write AuthContext.AuthContextType.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Setup Google auth
  const [, , promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_EXPO_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ["profile", "email"],
  });

  const mapUser = (firebaseUser: User): SimpleUser => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  });

  // 🔹 Save updated push token
  const registerPushToken = async (firebaseUser: User) => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

      if (token) {
        await setDoc(doc(db, "users", firebaseUser.uid), { pushToken: token }, { merge: true });
      }
    } catch (err) {
      console.error("Error saving push token", err);
    }
  };

  // 🔹 Create/Update user in Firestore
  const createUserProfile = async (firebaseUser: User, extraData?: any) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    await setDoc(
      userRef,
      {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || extraData?.displayName || null,
        photoURL: firebaseUser.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...extraData,
      },
      { merge: true }
    );

    await registerPushToken(firebaseUser);
  };

  // 🔹 Listen for auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapUser(firebaseUser));
        await AsyncStorage.setItem("user", JSON.stringify(mapUser(firebaseUser)));
        await registerPushToken(firebaseUser);
      } else {
        setUser(null);
        await AsyncStorage.removeItem("user");
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // 🔹 Auth helpers
  const signup = async (email: string, password: string, name: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await createUserProfile(user, { displayName: name });
    setUser(mapUser(user));
  };

  const login = async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    setUser(mapUser(user));
    await registerPushToken(user);
  };

  const loginWithGoogle = async () => {
    const result = await promptAsync();
    if (result?.type === "success") {
      const credential = GoogleAuthProvider.credential(result.params.id_token);
      const { user } = await signInWithCredential(auth, credential);

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await createUserProfile(user);
      } else {
        await registerPushToken(user);
      }

      setUser(mapUser(user));
    } else {
      throw new Error("Google login cancelled");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    await AsyncStorage.removeItem("user");
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (data: {
    displayName?: string;
    phoneNumber?: string;
    bio?: string;
    photoURL?: string;
    email?: string;
  }) => {
    if (user?.uid) {
      await setDoc(doc(db, "users", user.uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      setUser({ ...user, ...data });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signup,
    login,
    logout,
    loginWithGoogle,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};