// src/screens/UserScreen.tsx
import React, { useState } from "react";
import { Alert, RefreshControl } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "@/context/AuthContext";
import { useUserProfile, useUserSettings } from "@/hooks";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import {
  ProfileHeader,
  UserStats,
  SettingsSection,
  HelpSection,
  LogoutButton,
} from "@/components/User";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { useTheme } from "@/context/ThemeContext";

export default function UserScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  const {
    profile,
    loading,
    updateProfile,
  } = useUserProfile(user?.uid);

  const { settings, updateSettings } = useUserSettings(user?.uid);

  const [refreshing, setRefreshing] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  // 🔹 Refresh user profile
  // 🔹 Refresh user profile
  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Implement refresh logic or fetch profile if needed
    setRefreshing(false);
  };
  // 🔹 Upload profile picture
  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        await updateProfile({ photoURL: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload profile image");
    }
  };

  // 🔹 Logout workflow
  const handleLogout = async () => {
    try {
      setLogoutDialogVisible(false);
      await updateProfile({});
      await logout();
      navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
    }
  };

  // 🔹 Loading state
  if (loading && !refreshing) {
    return <LoadingOverlay />;
  }

  return (
    <ScreenWrapper
      scrollable
      safe
      padding={false}
      contentStyle={{ flexGrow: 1 }}
    >
      {/* Pull to refresh */}
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={[colors.primary]}
        tintColor={colors.primary}
      />

      {/* Profile */}
      <ProfileHeader
        onImagePress={handleImageUpload}   // still overrides photo
        onEditPress={() => navigation.navigate("EditProfile")}
      />

      {/* Stats */}
      <UserStats stats={profile?.stats} />

      {/* Settings */}
      <SettingsSection
        settings={settings}
        onSettingChange={updateSettings}
        onPasswordChange={() => navigation.navigate("ChangePassword")}
        onPrivacySettings={() => navigation.navigate("PrivacySettings")}
      />

      {/* Help Section */}
      <HelpSection
        onHelpCenter={() => navigation.navigate("HelpCenter")}
        onTerms={() => navigation.navigate("Terms")}
        onPrivacyPolicy={() => navigation.navigate("PrivacyPolicy")}
      />

      {/* Logout Button */}
      <LogoutButton onPress={() => setLogoutDialogVisible(true)} />

      {/* Confirm Logout */}
      <ConfirmationDialog
        visible={logoutDialogVisible}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={handleLogout}
        onCancel={() => setLogoutDialogVisible(false)}
        confirmText="Logout"
        cancelText="Cancel"
      />
    </ScreenWrapper>
  );
}