// src/navigation/AppNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator, StackNavigationOptions } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

// Screens
import HomeScreen from "@/screens/HomeScreen";
import DogsScreen from "@/screens/DogsScreen";
import DogScreen from "@/screens/DogScreen";
import DogProfileScreen from "@/screens/DogProfileScreen";
import MatchesScreen from "@/screens/MatchesScreen";
import ChatScreen from "@/screens/ChatScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import EditProfileScreen from "@/screens/EditProfileScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import NearbyDogsScreen from "@/screens/NearbyDogsScreen";
import NotificationsScreen from "@/screens/NotificationsScreen";

// ---- Types for stronger navigation typing ----
export type RootTabParamList = {
  Home: undefined;
  Dogs: undefined;
  Matches: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  NearbyDogs: undefined;
  Notifications: undefined;
};

export type DogsStackParamList = {
  DogsScreen: undefined;
  DogProfile: { isNewDog?: boolean; dogId?: string };
  DogScreen: { dogId: string };
};

export type MatchesStackParamList = {
  MatchesScreen: undefined;
  Chat: { recipientName?: string; dogId?: string };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

// ---- Navigator creators ----
const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator();

// ---- Stacks ----
function HomeStack() {
  const theme = useTheme();

  const screenOptions: StackNavigationOptions = {
    headerStyle: { backgroundColor: theme.colors.primary },
    headerTintColor: theme.colors.text.primary,
    headerTitleStyle: { ...theme.typography.h3 },
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NearbyDogs" component={NearbyDogsScreen} options={{ title: "Nearby Dogs" }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notifications" }} />
    </Stack.Navigator>
  );
}

function DogsStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { ...theme.typography.h3 },
      }}
    >
      <Stack.Screen name="DogsScreen" component={DogsScreen} options={{ title: "My Dogs" }} />
      <Stack.Screen
        name="DogProfile"
        component={DogProfileScreen}
        options={({ route }) => ({
          title: route.params?.isNewDog
            ? "Add New Dog"
            : route.params?.dogId
            ? "Edit Dog Profile"
            : "Dog Profile",
        })}
      />
      <Stack.Screen name="DogScreen" component={DogScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MatchesStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { ...theme.typography.h3 },
      }}
    >
      <Stack.Screen name="MatchesScreen" component={MatchesScreen} options={{ title: "Matches" }} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params?.recipientName || "Chat",
        })}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { ...theme.typography.h3 },
      }}
    >
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
    </Stack.Navigator>
  );
}

// ---- Main Tab Navigator ----
export default function AppNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Dogs") {
            iconName = focused ? "paw" : "paw-outline";
          } else if (route.name === "Matches") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          paddingBottom: 5,
          height: 55,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Dogs" component={DogsStack} />
      <Tab.Screen
        name="Matches"
        component={MatchesStack}
        options={{ tabBarBadge: 3 /* Replace with dynamic unread count */ }}
      />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}