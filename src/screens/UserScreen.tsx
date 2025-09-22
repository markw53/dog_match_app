// src/screens/UserScreen.tsx
import React, { useState } from "react";
import { Alert, RefreshControl } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "@/context/AuthContext";
import { useUserProfile, useUserSettings } from "../hooks";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import {
  ProfileHeader,
  UserStats,
  SettingsSection,
  HelpSection,
  LogoutButton,
} from "@/components/User";
import { LoadingOverlay, ConfirmationDialog } from "@/components/common/";
import { useTheme } from "@/context/ThemeContext";

export default function UserScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  const {
    profile,
    loading,
    updateProfile,
    loadProfile,
  } = useUserProfile(user?.uid);

  const { settings, updateSettings } = useUserSettings(user?.uid);

  const [refreshing, setRefreshing] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  // 🔹 Refresh profile
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProfile();
    } finally {
      setRefreshing(false);
    }
  };

  // 🔹 Upload profile image
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

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      setLogoutDialogVisible(false);

      await updateProfile({
        notificationToken: null,
        lastSeen: new Date(),
      });

      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Auth" }],
      });
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
    }
  };

  // 🔹 Loading
  if (loading && !refreshing) {
    return <LoadingOverlay />;
  }

  return (
    <ScreenWrapper
      scrollable
      style={{ flex: 1 }}
      contentStyle={{ flexGrow: 1 }}
      padding={false}
    >
      {/* Pull to refresh */}
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={[colors.primary]}
        tintColor={colors.primary}
      />

      {/* Profile Section */}
      <ProfileHeader
        profile={profile}
        onImagePress={handleImageUpload}
        onEditPress={() =>
          navigation.navigate("EditProfile", {
            profile,
            onUpdate: loadProfile,
          })
        }
      />

      <UserStats stats={profile?.stats} />

      <SettingsSection
        settings={settings}
        onSettingChange={updateSettings}
        onPasswordChange={() => navigation.navigate("ChangePassword")}
        onPrivacySettings={() => navigation.navigate("PrivacySettings")}
      />

      <HelpSection
        onHelpCenter={() => navigation.navigate("HelpCenter")}
        onTerms={() => navigation.navigate("Terms")}
        onPrivacyPolicy={() => navigation.navigate("PrivacyPolicy")}
      />

      <LogoutButton onPress={() => setLogoutDialogVisible(true)} />

      {/* Confirmation Dialog */}
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