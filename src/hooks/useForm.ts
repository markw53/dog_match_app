// src/hooks/useForm.ts
import { useState, useCallback } from "react";
import * as Yup from "yup";

type Errors<T> = Partial<Record<keyof T, string>>;
type Touched<T> = Partial<Record<keyof T, boolean>>;

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: Yup.ObjectSchema<any>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Errors<T>>({});
  const [touched, setTouched] = useState<Touched<T>>({});

  // ✅ Set field value
  const setFieldValue = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      if (touched[name] && validationSchema) {
        validateField(name, value);
      }
    },
    [touched, validationSchema]
  );

  // ✅ Mark field as touched & validate
  const setFieldTouched = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validationSchema) {
        validateField(name, values[name]);
      }
    },
    [values, validationSchema]
  );

  // ✅ Validate a single field
  const validateField = useCallback(
    async (name: keyof T, value: any) => {
      if (!validationSchema) return;

      try {
        await validationSchema.validateAt(name as string, {
          ...values,
          [name]: value,
        });

        setErrors((prev) => ({ ...prev, [name]: undefined }));
      } catch (err: any) {
        setErrors((prev) => ({ ...prev, [name]: err.message }));
      }
    },
    [validationSchema, values]
  );

  // ✅ Validate full form
  const validateForm = useCallback(async () => {
    if (!validationSchema) return true;

    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err: any) {
      const newErrors: Errors<T> = {};
      if (err.inner) {
        err.inner.forEach((e: any) => {
          if (e.path) {
            newErrors[e.path as keyof T] = e.message;
          }
        });
      }
      setErrors(newErrors);
      return false;
    }
  }, [values, validationSchema]);

  // ✅ Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    setValues,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
  };
}