// src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification as firebaseSendVerification,
  User,
} from "firebase/auth";
import { auth } from "../config/firebaseAuth"; // your firebaseAuth.ts config
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { Alert, Platform } from "react-native";
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_EXPO_CLIENT_ID,
} from "@env";

// Required for Expo AuthSession on Web
WebBrowser.maybeCompleteAuthSession();

export interface SimpleUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Expo Google Auth
  const [, , promptAsync] = Google.useIdTokenAuthRequest({
    expoClientId: GOOGLE_EXPO_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ["profile", "email"],
  });

  // Helper: create SimpleUser object
  const mapUser = (u: User): SimpleUser => ({
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
  });

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const simpleUser = mapUser(firebaseUser);
        setUser(simpleUser);
        await AsyncStorage.setItem("user", JSON.stringify(simpleUser));
      } else {
        setUser(null);
        await AsyncStorage.removeItem("user");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Signup with email/password
  const signup = async (email: string, password: string, name: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await firebaseSendVerification(user, {
      url: "https://your-app-domain.com/verify-email",
      handleCodeInApp: true,
    });
    setUser(mapUser(user));
  };

  // Login with email/password
  const login = async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    setUser(mapUser(user));
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  // Google login
  const loginWithGoogle = async () => {
    const result = await promptAsync();
    if (result?.type === "success") {
      const credential = GoogleAuthProvider.credential(result.params.id_token);
      const { user } = await signInWithCredential(auth, credential);
      setUser(mapUser(user));
    } else {
      throw new Error("Google login cancelled");
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
    Alert.alert("Password Reset", "Check your email for instructions");
  };

  // Send verification email
  const sendVerification = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await firebaseSendVerification(auth.currentUser, {
        url: "https://your-app-domain.com/verify-email",
        handleCodeInApp: true,
      });
    }
  };

  // Update displayName/photo
  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, updates);
      const updatedUser = { ...mapUser(auth.currentUser), ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
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
    sendVerification,
    updateUserProfile,
    isEmailVerified: auth.currentUser?.emailVerified ?? false,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};