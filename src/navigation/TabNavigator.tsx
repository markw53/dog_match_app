// src/navigation/TabNavigator.tsx
import React, { useEffect } from "react";
import {
  Platform,
  TouchableOpacity,
  Alert,
  BackHandler,
} from "react-native";
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

// Screens
import HomeScreen from "@/screens/HomeScreen";
import UserScreen from "@/screens/UserScreen";
import DogNavigator from "@/navigation/DogsNavigator";

// ---- Strong typing ----
export type TabParamList = {
  Home: undefined;
  Dogs: undefined;
  User: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { logout } = useAuth();
  const navigation = useNavigation();
  const theme = useTheme();

  // Handle back button on Android to prevent exiting app unexpectedly
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (navigation.isFocused()) {
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Logout with confirmation dialog
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: "Auth" as never }], // "Auth" must exist in RootNavigator
            });
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout");
          }
        },
        style: "destructive",
      },
    ]);
  };

  // ---- Shared tabBar + header options ----
  const screenOptions = ({ route }): BottomTabNavigationOptions => ({
    headerStyle: {
      backgroundColor: theme.colors.primary,
    },
    headerTitleStyle: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
    },
    headerTintColor: theme.colors.text.primary,
    tabBarStyle: {
      backgroundColor: theme.colors.primary,
      borderTopColor: theme.colors.secondary,
      paddingBottom: Platform.OS === "ios" ? theme.spacing.md : theme.spacing.sm,
      height: Platform.OS === "ios" ? 90 : 60,
    },
    tabBarIcon: ({ focused, color, size }) => {
      let iconName: keyof typeof Ionicons.glyphMap = "home-outline";

      if (route.name === "Home") {
        iconName = focused ? "home" : "home-outline";
      } else if (route.name === "Dogs") {
        iconName = focused ? "paw" : "paw-outline";
      } else if (route.name === "User") {
        iconName = focused ? "person" : "person-outline";
      }

      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: theme.colors.text.primary,
    tabBarInactiveTintColor: theme.colors.text.secondary,
  });

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Waggle" }}
      />
      <Tab.Screen
        name="Dogs"
        component={DogNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{
          title: "Profile",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: theme.spacing.md }}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
}