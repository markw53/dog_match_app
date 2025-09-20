// src/navigation/AppStack.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "@/screens/HomeScreen";
import DogsNavigator from "./DogsNavigator"; // stack with DogList, DogDetails
import UserScreen from "@/screens/UserScreen";

export type AppStackParamList = {
  Home: undefined;
  Dogs: undefined; // could be a nested stack
  User: undefined;
};

const Tab = createBottomTabNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home-outline";
          if (route.name === "Home") iconName = "home-outline";
          if (route.name === "Dogs") iconName = "paw-outline";
          if (route.name === "User") iconName = "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#BDB76B",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dogs" component={DogsNavigator} />
      <Tab.Screen name="User" component={UserScreen} />
    </Tab.Navigator>
  );
}