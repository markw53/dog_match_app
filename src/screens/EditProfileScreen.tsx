// src/screens/EditProfileScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

import FormField from "../components/FormField";
import ImagePickerComponent from "../components/ImagePickerComponent";
import LoadingOverlay from "../components/LoadingOverlay";
import { globalStyles } from "../styles/globalStyles";

import * as Location from "expo-location";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { auth } from "../config/firebaseAuth";
import { updateProfile, PhoneAuthProvider, updatePhoneNumber } from "firebase/auth";

// --- Helper: upload image to Firebase Storage ---
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Utility: Upload
async function uploadImageToFirebase(uri: string, uid: string): Promise<string> {
  const storage = getStorage();
  const blob = await (await fetch(uri)).blob();
  const imageRef = ref(storage, `user_profiles/${uid}/${Date.now()}.jpg`);
  await uploadBytes(imageRef, blob);
  return getDownloadURL(imageRef);
}

export default function EditProfileScreen({ navigation }: any) {
  const { user } = useAuth(); // simpleUser from context
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  const [formData, setFormData] = useState<any>({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phoneNumber: "",
    location: "",
    bio: "",
    photoURL: user?.photoURL || null,
    latitude: null,
    longitude: null,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const ref = doc(db, "users", user!.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setFormData((prev: any) => ({
          ...prev,
          ...snap.data(),
        }));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImagePick = async (uri: string) => {
    try {
      setLoading(true);
      const downloadURL = await uploadImageToFirebase(uri, user!.uid);
      handleInputChange("photoURL", downloadURL);
    } catch (error) {
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationPick = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required");
        return;
      }
      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (address[0]) {
        const locationString = `${address[0].city}, ${address[0].region}`;
        handleInputChange("location", locationString);
        handleInputChange("latitude", location.coords.latitude);
        handleInputChange("longitude", location.coords.longitude);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerification = async () => {
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        formData.phoneNumber,
        // NOTE: in React Native you'd need a Recaptcha verifier.
        // This is simplified for demonstration.
      );
      setVerificationId(verificationId);
      Alert.alert("Verification code sent to your phone");
    } catch (error) {
      Alert.alert("Error", "Failed to send verification code");
    }
  };

  const verifyPhoneNumber = async () => {
    try {
      if (!verificationId) return;
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await updatePhoneNumber(auth.currentUser!, credential);
      Alert.alert("Success", "Phone number verified");
    } catch (error) {
      Alert.alert("Error", "Invalid verification code");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.displayName.trim()) {
        setFormErrors((prev) => ({
          ...prev,
          displayName: "Name is required",
        }));
        return;
      }
      setLoading(true);

      // ✅ 1. Update Firebase Auth profile (name + photo)
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName,
          photoURL: formData.photoURL || undefined,
        });
      }

      // ✅ 2. Update Firestore user doc
      const ref = doc(db, "users", user!.uid);
      await setDoc(
        ref,
        {
          displayName: formData.displayName,
          photoURL: formData.photoURL || null,
          phoneNumber: formData.phoneNumber || null,
          location: formData.location || null,
          bio: formData.bio || null,
          latitude: formData.latitude,
          longitude: formData.longitude,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <ImagePickerComponent
            value={formData.photoURL}
            onChange={handleImagePick}
            error={formErrors.photoURL}
          />

          <FormField
            label="Name"
            value={formData.displayName}
            onChangeText={(v) => handleInputChange("displayName", v)}
            placeholder="Enter your name"
            error={formErrors.displayName}
            required
          />

          <FormField
            label="Email"
            value={formData.email}
            editable={false}
            placeholder="Your email"
          />

          <View style={styles.phoneContainer}>
            <FormField
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(v) => handleInputChange("phoneNumber", v)}
              keyboardType="phone-pad"
              placeholder="Enter phone number"
            />
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handlePhoneVerification}
            >
              <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>
          </View>

          {verificationId && (
            <FormField
              label="Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              placeholder="Enter verification code"
            />
          )}

          <View style={styles.locationContainer}>
            <FormField
              label="Location"
              value={formData.location}
              placeholder="Select location"
              editable={false}
            />
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleLocationPick}
            >
              <Ionicons name="location" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <FormField
            label="Bio"
            value={formData.bio}
            onChangeText={(v) => handleInputChange("bio", v)}
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      {loading && <LoadingOverlay />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContainer: { flexGrow: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    fontFamily: globalStyles.fontFamily,
  },
  backButton: { padding: 5 },
  saveButton: { padding: 5 },
  saveButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: globalStyles.fontFamily,
  },
  formContainer: { padding: 15 },
  phoneContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  verifyButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  verifyButtonText: { color: "#fff", fontSize: 14 },
  locationContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  locationButton: { padding: 10 },
});