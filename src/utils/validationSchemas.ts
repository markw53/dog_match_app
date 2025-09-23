// src/utils/validationSchemas.ts
import * as Yup from "yup";

export interface DogFormValues {
  name: string;
  breed: string;
  dateOfBirth: Date;
  gender: "male" | "female";
  weight: number;
  height: number;
  description?: string;
  temperament?: string;
  isAvailableForMating: boolean;
  healthCertificates: {
    vaccinations: boolean;
    healthCheck: boolean;
  };
}

// 🔹 Reusable error messages
const REQUIRED = "This field is required";
const POSITIVE = "Must be positive";

export const dogValidationSchema = Yup.object<DogFormValues>().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),

  breed: Yup.string().required("Breed is required").max(50, "Breed too long"),

  dateOfBirth: Yup.date()
    .required("Date of birth is required")
    .max(new Date(), "Date of birth cannot be in the future"),

  gender: Yup.mixed<DogFormValues["gender"]>()
    .oneOf(["male", "female"], "Invalid gender")
    .required(REQUIRED),

  weight: Yup.number()
    .required("Weight is required")
    .positive(POSITIVE)
    .max(200, "Weight seems too high"),

  height: Yup.number()
    .required("Height is required")
    .positive(POSITIVE)
    .max(150, "Height seems too high"),

  description: Yup.string().max(
    500,
    "Description must be less than 500 characters"
  ),

  temperament: Yup.string().max(
    300,
    "Temperament must be less than 300 characters"
  ),

  isAvailableForMating: Yup.boolean().default(true),

  healthCertificates: Yup.object({
    vaccinations: Yup.boolean().default(false),
    healthCheck: Yup.boolean().default(false),
  }),
});