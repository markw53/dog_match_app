// src/navigation/AuthNavigator.tsx
import React from "react";
import { createStackNavigator, StackNavigationOptions } from "@react-navigation/stack";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

import LoginScreen from "@/screens/LoginScreen";
import SignupScreen from "@/screens/SignupScreen";
import ForgotPasswordScreen from "@/screens/ForgotPasswordScreen";
import VerificationScreen from "@/screens/VerificationScreen"; // make sure this exists

// 🔹 Stack Param Types
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Verification: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const { user, isEmailVerified } = useAuth();
  const theme = useTheme();

  // 🔹 Default Screen Options (apply theme values)
  const screenOptions: StackNavigationOptions = {
    headerShown: false,
    cardStyle: { backgroundColor: "transparent" },
    headerStyle: {
      backgroundColor: theme.colors.primary,
    },
    headerTitleStyle: {
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.text.primary,
    },
    headerTintColor: theme.colors.text.primary,
    cardStyleInterpolator: ({ current, layouts }) => ({
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    }),
  };

  return (
    <AuthStack.Navigator screenOptions={screenOptions}>
      {user && !isEmailVerified ? (
        <AuthStack.Screen name="Verification" component={VerificationScreen} />
      ) : (
        <>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Signup" component={SignupScreen} />
          <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </AuthStack.Navigator>
  );
}