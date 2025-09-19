// src/screens/SignupScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { validateUserProfile } from "../utils/validation";
import { getFontStyle } from "../utils/fonts";

import FormField from "../components/FormField";
import Button from "../components/common/Button";
import TextFooter from "../components/TextFooter";
import Divider from "../components/common/Divider";
import SocialButton from "../components/common/SocialButton";

// --- Auth stack typing ---
type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

// --- Small components ---
const BackButton = ({ onPress }: { onPress: () => void }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <TouchableOpacity style={styles.backButton} onPress={onPress}>
      <Ionicons name="arrow-back" size={24} color={colors.primary} />
    </TouchableOpacity>
  );
};

const LoginPrompt = ({ onPress }: { onPress: () => void }) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.loginContainer}>
      <Text style={styles.loginText}>Already have an account?</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.loginLink}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Main SignupScreen ---
export default function SignupScreen({ navigation }: Props) {
  const { signup, signupWithGoogle, loading } = useAuth();
  const styles = useThemedStyles(createStyles);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>(
    {}
  );

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = validateUserProfile(formData);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    try {
      if (!validateForm()) return;

      await signup(formData.email, formData.password, formData.fullName);
      Alert.alert(
        "Success",
        "Account created successfully! Please log in.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Registration failed.");
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signupWithGoogle();
      // after Google signup you might want to route directly
      // navigation.replace("Home");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Google signup failed");
    }
  };

  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <ImageBackground
      source={require("../assets/waggle-background.png")}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              <BackButton onPress={() => navigation.goBack()} />
              <Text style={styles.title}>Create Account</Text>

              <FormField
                label="Full Name"
                value={formData.fullName}
                onChangeText={(v) => handleInputChange("fullName", v)}
                placeholder="Enter your full name"
                autoCapitalize="words"
                icon="person-outline"
                error={formErrors.fullName || undefined}
                required
              />

              <FormField
                label="Email"
                value={formData.email}
                onChangeText={(v) => handleInputChange("email", v)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                error={formErrors.email || undefined}
                required
              />

              <FormField
                label="Password"
                value={formData.password}
                onChangeText={(v) => handleInputChange("password", v)}
                placeholder="Create password"
                secureTextEntry={!showPassword.password}
                icon="lock-closed-outline"
                rightIcon={showPassword.password ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => togglePasswordVisibility("password")}
                error={formErrors.password || undefined}
                helpText="Must be at least 8 characters with 1 number"
                required
              />

              <FormField
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(v) => handleInputChange("confirmPassword", v)}
                placeholder="Confirm password"
                secureTextEntry={!showPassword.confirmPassword}
                icon="lock-closed-outline"
                rightIcon={
                  showPassword.confirmPassword ? "eye-off-outline" : "eye-outline"
                }
                onRightIconPress={() => togglePasswordVisibility("confirmPassword")}
                error={formErrors.confirmPassword || undefined}
                required
              />

              <Button
                title="Sign Up"
                onPress={handleSignup}
                loading={loading}
                disabled={loading}
                style={styles.signupButton}
              />

              <Divider text="OR" />

              <SocialButton
                icon="logo-google"
                title="Sign up with Google"
                onPress={handleGoogleSignup}
              />

              <LoginPrompt onPress={() => navigation.navigate("Login")} />
            </View>
          </ScrollView>

          <TextFooter />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// --- Styles ---
const createStyles = (theme: any) => ({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    ...theme.shadows.medium,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
  },
  title: {
    ...getFontStyle("bold", "xxxl"),
    textAlign: "center",
    marginBottom: 30,
    color: theme.colors.text.primary,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  signupButton: {
    marginBottom: 20,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    ...getFontStyle("regular", "md"),
    color: theme.colors.text.secondary,
    marginRight: 5,
  },
  loginLink: {
    ...getFontStyle("medium", "md"),
    color: theme.colors.primary,
  },
});