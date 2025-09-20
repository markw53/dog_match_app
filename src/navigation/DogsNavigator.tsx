// src/navigation/DogsNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DogListScreen from "@/screens/DogListScreen";
import DogProfileScreen from "@/screens/DogProfileScreen";

export type DogsStackParamList = {
  DogList: undefined;
  DogProfile: { dogId?: string; isNewDog: boolean };
};

const Stack = createNativeStackNavigator<DogsStackParamList>();

export default function DogsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DogList"
        component={DogListScreen}
        options={{ title: "My Dogs" }}
      />
      <Stack.Screen
        name="DogProfile"
        component={DogProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}