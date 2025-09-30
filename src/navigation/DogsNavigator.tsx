// src/navigation/DogNavigator.tsx
import React from "react";
import { TouchableOpacity } from "react-native";
import { createStackNavigator, StackNavigationOptions } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext"; // ✅ theme-aware

import DogScreen from "@/screens/DogScreen";
import DogProfileScreen from "@/screens/DogProfileScreen";

// 🔹 Strong typing for params
export type DogStackParamList = {
  DogList: undefined;
  DogProfile: { isNewDog?: boolean; dogId?: string };
};

const Stack = createStackNavigator<DogStackParamList>();

export default function DogNavigator() {
  const theme = useTheme();

  const screenOptions: StackNavigationOptions = {
    headerStyle: { backgroundColor: theme.colors.primary },
    headerTitleStyle: { ...theme.typography.h3 },
    headerTintColor: theme.colors.text.primary,
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="DogList"
        component={DogScreen}
        options={({ navigation }) => ({
          title: "Dogs",
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("DogProfile", { isNewDog: true })
              }
              style={{ marginRight: theme.spacing.md }}
            >
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
          ),
        })}
      />

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
    </Stack.Navigator>
  );
}