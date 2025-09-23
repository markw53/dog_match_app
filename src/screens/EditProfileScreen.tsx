// src/screens/EditProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useAuth } from "@/context/AuthContext";
import FormFieldWrapper from "@/components/common/FormFieldWrapper";
import FormField from "@/components/FormField";
import ImagePickerComponent from "@/components/common/ImagePickerComponent";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import Button from "@/components/common/Button";

import { useTheme } from "@/context/ThemeContext";
import { validateProfileData } from "@/utils/validation";

export default function EditProfileScreen({ navigation }: any) {
  const { user, updateUserProfile } = useAuth();
  const { colors, spacing } = useTheme();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phoneNumber: "",
    bio: "",
    photoURL: user?.photoURL || undefined,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 🔹 Simple field change handler
  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: "" })); // clear error on edit
  };

  // 🔹 Save profile
  const handleSubmit = async () => {
    const errors = validateProfileData(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile(formData);
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Photo */}
        <FormFieldWrapper label="Profile Photo" error={formErrors.photoURL}>
          <ImagePickerComponent
            value={formData.photoURL}
            onChange={(uri) => handleInputChange("photoURL", uri)}
            error={formErrors.photoURL}
          />
        </FormFieldWrapper>

        {/* Display Name */}
        <FormFieldWrapper label="Full Name" required error={formErrors.displayName}>
          <FormField
            value={formData.displayName}
            onChangeText={(v) => handleInputChange("displayName", v)}
            placeholder="Enter your name"
          />
        </FormFieldWrapper>

        {/* Email (read‑only) */}
        <FormFieldWrapper label="Email" required>
          <FormField
            value={formData.email}
            editable={false}
            onChangeText={() => {}}
          />
        </FormFieldWrapper>

        {/* Phone */}
        <FormFieldWrapper label="Phone Number" error={formErrors.phoneNumber}>
          <FormField
            value={formData.phoneNumber}
            onChangeText={(v) => handleInputChange("phoneNumber", v)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </FormFieldWrapper>

        {/* Bio */}
        <FormFieldWrapper label="Bio" error={formErrors.bio}>
          <FormField
            value={formData.bio}
            onChangeText={(v) => handleInputChange("bio", v)}
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={3}
          />
        </FormFieldWrapper>

        {/* Submit */}
        <Button
          title="Save Changes"
          onPress={handleSubmit}
          fullWidth
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}