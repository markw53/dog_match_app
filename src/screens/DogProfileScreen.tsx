// src/screens/DogProfileScreen.tsx
import React, { useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useForm, useImagePicker, useDogs } from "@/hooks";
import { useAuth } from "@/context/AuthContext";
import { dogValidationSchema } from "@/utils/validationSchemas";
import { useTheme } from "@/context/ThemeContext";

// 🔑 Reusable UI
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { Header } from "@/components/Dog/DogHeader"; // ✅ Reuse your custom header
import ImageUploader from "@/components/DogProfile/ImageUploader";
import FormSection from "@/components/DogProfile/FormSection";

export default function DogProfileScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const { colors, spacing } = useTheme();
  const { dogId, isNewDog } = route.params || {};

  const { getDog, createDog, updateDog, loading: dogLoading } = useDogs();

  const {
    images,
    loading: imageLoading,
    pickImage,
    removeImage,
  } = useImagePicker({
    aspect: [4, 3],
    quality: 0.8,
    allowsMultiple: false,
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    validateForm,
    setValues,
  } = useForm({
    initialValues: {
      name: "",
      breed: "",
      dateOfBirth: new Date(),
      gender: "male",
      weight: "",
      height: "",
      description: "",
      temperament: "",
      isAvailableForMating: false,
      healthCertificates: {
        vaccinations: false,
        healthCheck: false,
      },
      imageUrl: "",
    },
    validationSchema: dogValidationSchema,
  });

  useEffect(() => {
    if (dogId && !isNewDog) {
      loadDogData();
    }
  }, [dogId]);

  const loadDogData = async () => {
    try {
      const dogData = await getDog(dogId);
      setValues(dogData);
      if (dogData.imageUrl) setFieldValue("imageUrl", dogData.imageUrl);
    } catch (error) {
      Alert.alert("Error", "Failed to load dog data");
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    try {
      const isValid = await validateForm();
      if (!isValid) return;

      if (!images.length && !values.imageUrl) {
        Alert.alert("Error", "Please add a photo of your dog");
        return;
      }

      const dogData = {
        ...values,
        ownerId: user.uid,
        updatedAt: new Date(),
      };

      if (isNewDog) {
        await createDog(dogData, images);
        Alert.alert("Success", "Dog profile created successfully");
      } else {
        await updateDog(dogId, dogData, images);
        Alert.alert("Success", "Dog profile updated successfully");
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  return (
    <ScreenWrapper
      scrollable
      safe
      padding={false} // We'll manage card spacing ourselves
      style={{ backgroundColor: colors.background }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* ✅ Themed Header */}
        <Header
          title={isNewDog ? "Add New Dog" : "Edit Dog Profile"}
          onBack={() => navigation.goBack()}
        />

        {/* ✅ ScrollView inside wrapper */}
        <ScrollView
          contentContainerStyle={{
            padding: spacing.md,
            paddingBottom: spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ✅ Card for Image section */}
          <Card>
            <ImageUploader
              images={images}
              currentImage={values.imageUrl}
              onPickImage={pickImage}
              onRemoveImage={removeImage}
              loading={imageLoading}
            />
          </Card>

          {/* ✅ Card for Form */}
          <Card>
            <FormSection
              values={values}
              errors={errors}
              touched={touched}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
            />
          </Card>

          {/* ✅ Submit button */}
          <View style={{ marginTop: spacing.lg }}>
            <Button
              title={isNewDog ? "Create Dog Profile" : "Save Changes"}
              onPress={handleSubmit}
              loading={dogLoading || imageLoading}
              fullWidth
              variant="primary"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}