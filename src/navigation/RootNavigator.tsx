// src/navigation/MainNavigator.tsx
import React from "react";
import { createStackNavigator, StackNavigationOptions } from "@react-navigation/stack";
import { useTheme } from "@/context/ThemeContext";

// Screens
import TabNavigator from "@/navigation/TabNavigator";
import EditProfileScreen from "@/screens/EditProfileScreen";
import ChangePasswordScreen from "@/screens/ChangePasswordScreen";
import PrivacySettingsScreen from "@/screens/PrivacySettingsScreen";
import HelpCenterScreen from "@/screens/HelpCenterScreen";
import TermsScreen from "@/screens/TermsScreen";
import PrivacyPolicyScreen from "@/screens/PrivacyPolicyScreen";
import HelpTopicListScreen from "@/screens/HelpTopicListScreen";
import ContactScreen from "@/screens/ContactScreen";
import HelpDetailScreen from "@/screens/HelpDetailScreen";
import ChatsListScreen from "@/screens/ChatsListScreen";
import ChatScreen from "@/screens/ChatScreen";

// ---- Strong typing for params ----
export type MainStackParamList = {
  TabNavigator: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  PrivacySettings: undefined;
  HelpCenter: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
  HelpTopicList: undefined;
  Contact: undefined;
  HelpDetail: undefined;
  Chats: undefined;
  Chat: { chatId: string; recipientName?: string };
};

const Stack = createStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  const theme = useTheme();

  // 🔹 Reusable screenOptions for headers
  const defaultHeaderOptions: StackNavigationOptions = {
    headerStyle: { backgroundColor: theme.colors.primary },
    headerTintColor: theme.colors.text.primary,
    headerTitleStyle: { ...theme.typography.h3 },
    headerBackTitleVisible: false,
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tabs Entry Point */}
      <Stack.Screen name="TabNavigator" component={TabNavigator} />

      {/* Modal Screens */}
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ headerShown: false }} />

      {/* Help & Policy */}
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{ ...defaultHeaderOptions, title: "Help Center", headerShown: true }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ ...defaultHeaderOptions, title: "Terms of Service", headerShown: true }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ ...defaultHeaderOptions, title: "Privacy Policy", headerShown: true }}
      />
      <Stack.Screen name="HelpTopicList" component={HelpTopicListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HelpDetail" component={HelpDetailScreen} options={{ headerShown: false }} />

      {/* Chat Screens */}
      <Stack.Screen
        name="Chats"
        component={ChatsListScreen}
        options={{ ...defaultHeaderOptions, title: "Messages", headerShown: true }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          ...defaultHeaderOptions,
          headerShown: true,
          title: route.params?.recipientName ?? "Chat",
        })}
      />
    </Stack.Navigator>
  );
}