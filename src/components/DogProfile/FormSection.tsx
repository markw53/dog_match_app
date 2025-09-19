// src/components/DogProfile/FormSection.tsx
import React from "react";
import { View } from "react-native";
import FormField from "../FormField";
import { useTheme } from "../../context/ThemeContext";

interface FormSectionProps {
  values: any;
  errors: any;
  touched: any;
  handleChange: (field: string) => (value: string) => void;
  handleBlur: (field: string) => void;
  setFieldValue: (field: string, value: any) => void;
}

const FormSection: React.FC<FormSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}) => {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.md }}>
      <FormField
        label="Name"
        value={values.name}
        onChangeText={handleChange("name")}
        onBlur={() => handleBlur("name")}
        placeholder="Enter dog's name"
        error={touched.name && errors.name ? errors.name : ""}
      />

      <FormField
        label="Breed"
        value={values.breed}
        onChangeText={handleChange("breed")}
        onBlur={() => handleBlur("breed")}
        placeholder="Enter dog's breed"
        error={touched.breed && errors.breed ? errors.breed : ""}
      />

      <FormField
        label="Weight (kg)"
        value={values.weight}
        onChangeText={handleChange("weight")}
        onBlur={() => handleBlur("weight")}
        placeholder="Enter weight"
        keyboardType="numeric"
      />

      <FormField
        label="Height (cm)"
        value={values.height}
        onChangeText={handleChange("height")}
        onBlur={() => handleBlur("height")}
        placeholder="Enter height"
        keyboardType="numeric"
      />

      <FormField
        label="Temperament"
        value={values.temperament}
        onChangeText={handleChange("temperament")}
        onBlur={() => handleBlur("temperament")}
        placeholder="E.g. Friendly, Active"
      />

      <FormField
        label="Description"
        value={values.description}
        onChangeText={handleChange("description")}
        onBlur={() => handleBlur("description")}
        placeholder="Short bio about your dog"
        multiline
        numberOfLines={3}
      />
    </View>
  );
};

export default FormSection;