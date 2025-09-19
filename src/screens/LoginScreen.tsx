// src/screens/LoginScreen.tsx

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

import FormField from "../components/FormField";
import TextFooter from "../components/TextFooter";
import Button from "../components/common/Button";
import { createStyles } from "../styles/loginScreenStyles";

// --- Navigation param types ---
type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

// --- Social button ---
const SocialButton = ({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress: () => void;
}) => {
  const styles = useThemedStyles(createStyles);
  return (
    <TouchableOpacity style={styles.socialButton} onPress={onPress}>
      <Ionicons name={icon as any} size={24} color="#DB4437" />
      <Text style={styles.socialButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

// --- Divider component ---
const Divider = ({ text }: { text: string }) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.divider} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.divider} />
    </View>
  );
};

// --- Main Screen ---
export default function LoginScreen({ navigation }: Props) {
  const { login, loginWithGoogle, loading } = useAuth();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (name: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      await login(formData.email, formData.password);
      // ✅ if login is successful, navigation could go to Home
      navigation.replace("Home");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Login failed");
      setError(err.message);
    }
  };

  const isFormValid = formData.email && formData.password;

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
              <Text style={styles.welcomeTitle}>Welcome to Waggle!</Text>

              {/* Email Field */}
              <FormField
                label="Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                error={error ?? ""}
                required
              />

              {/* Password Field */}
              <FormField
                label="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                icon="lock-closed-outline"
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                error={error ?? ""}
                required
              />

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <Button
                title="Login"
                onPress={handleLogin}
                disabled={!isFormValid || loading}
                loading={loading}
                variant="primary"
                style={styles.loginButton}
              />

              {/* Divider */}
              <Divider text="OR" />

              {/* Social Login */}
              <SocialButton
                icon="logo-google"
                title="Continue with Google"
                onPress={async () => {
                  try {
                    await loginWithGoogle();
                    navigation.replace("Home");
                  } catch (error: any) {
                    Alert.alert("Error", error.message);
                  }
                }}
              />

              {/* Signup Redirect */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Signup")}
                >
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <TextFooter />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}