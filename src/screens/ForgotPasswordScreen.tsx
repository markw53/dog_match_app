// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Alert,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { useTheme } from "../context/ThemeContext";
import { getFontStyle } from "../utils/fonts";
import Button from "../components/common/Button";
import FormField from "../components/FormField";

// Define Auth stack navigation param list
type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const { resetPassword, loading } = useAuth(); // <-- from AuthContext
  const styles = useThemedStyles(createStyles);

  // simple email regex for validation
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidEmail = validateEmail(email);

  const handleResetPassword = async () => {
    try {
      await resetPassword(email);
      Alert.alert(
        "Success",
        "Password reset instructions have been sent to your email",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to reset password");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/waggle-background.png")}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Reset Password</Text>

          <Text style={styles.description}>
            Enter your email address and we'll send you instructions to reset
            your password.
          </Text>

          <FormField
            label="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            icon="mail-outline"
            required
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              loading={loading}
              disabled={!isValidEmail || loading}
              variant="primary"
              icon="send-outline"
              fullWidth
            />

            <Button
              title="Back to Login"
              onPress={() => navigation.navigate("Login")}
              variant="ghost"
              fullWidth
              style={styles.backButton}
            />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// --- styles ---
const createStyles = (theme: any) =>
  StyleSheet.create({
    backgroundImage: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    safeArea: {
      flex: 1,
    },
    formContainer: {
      flex: 1,
      justifyContent: "center",
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      margin: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.medium,
    },
    title: {
      ...getFontStyle("bold", "xxl"),
      textAlign: "center",
      marginBottom: theme.spacing.md,
      color: theme.colors.text.primary,
    },
    description: {
      ...getFontStyle("regular", "md"),
      textAlign: "center",
      marginBottom: theme.spacing.xl,
      color: theme.colors.text.secondary,
    },
    buttonContainer: {
      marginTop: theme.spacing.lg,
    },
    backButton: {
      marginTop: theme.spacing.md,
    },
  });