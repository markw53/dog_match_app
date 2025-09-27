// src/utils/helpers.ts
import { Platform, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

// If you use Firestore Timestamp, optionally import type
import type { Timestamp } from "firebase/firestore";

/* ---------------------------------------------------------
 *  Date & Time Utilities
 * --------------------------------------------------------- */
const toJSDate = (date: Date | Timestamp): Date =>
  date instanceof Date ? date : date.toDate();

export const formatDate = (date?: Date | Timestamp): string => {
  if (!date) return "";
  return toJSDate(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

export const formatTime = (date?: Date | Timestamp): string => {
  if (!date) return "";
  return toJSDate(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

export const calculateAge = (dateOfBirth: string | number | Date): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const getRelativeTime = (date?: Date | Timestamp): string => {
  if (!date) return "";
  const d = toJSDate(date);
  const diffInSeconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(d);
};

/* ---------------------------------------------------------
 *  Location Utilities
 * --------------------------------------------------------- */
const toRad = (value: number): number => (value * Math.PI) / 180;

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const formatDistance = (distance: number): string =>
  distance < 1 ? `${Math.round(distance * 1000)}m` : `${Math.round(distance)}km`;

/* ---------------------------------------------------------
 *  Image Utilities
 * --------------------------------------------------------- */
export const getImageDimensions = (width: number, height: number, maxWidth: number, maxHeight: number) => {
  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return { width: width * ratio, height: height * ratio };
};

export const compressImage = async (
  uri: string,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8,
  }
): Promise<string> => {
  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: options.maxWidth, height: options.maxHeight } }],
      { compress: options.quality, format: SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.error("Error compressing image:", error);
    return uri;
  }
};

/* ---------------------------------------------------------
 *  Validation Utilities
 * --------------------------------------------------------- */
export const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password: string): boolean =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

export const validateDogProfile = (dogData: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!dogData.name?.trim()) errors.name = "Name is required";
  if (!dogData.breed?.trim()) errors.breed = "Breed is required";
  if (!dogData.gender) errors.gender = "Gender is required";
  if (!dogData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
  if (!dogData.weight || dogData.weight <= 0) errors.weight = "Valid weight is required";
  return errors;
};

/* ---------------------------------------------------------
 *  Error Handling
 * --------------------------------------------------------- */
export const handleError = (error: any): string => {
  console.error("Error:", error);
  if (error?.code) {
    switch (error.code) {
      case "auth/user-not-found":
        return "No account found with this email";
      case "auth/wrong-password":
        return "Incorrect password";
      case "auth/email-already-in-use":
        return "Email already in use";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/weak-password":
        return "Password is too weak";
      case "storage/object-not-found":
        return "File not found";
      case "storage/unauthorized":
        return "Unauthorized access";
      default:
        return error.message || "An unexpected error occurred";
    }
  }
  return "An unexpected error occurred";
};

/* ---------------------------------------------------------
 *  Data Formatting
 * --------------------------------------------------------- */
export const formatPhoneNumber = (num: string): string => {
  const cleaned = ("" + num).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : num;
};

export const formatCurrency = (amount: number, currency: string = "USD"): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

/* ---------------------------------------------------------
 *  Device & Platform Utilities
 * --------------------------------------------------------- */
export const isIOS = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";

export const getDeviceType = (): "portrait" | "landscape" => {
  const { width, height } = Dimensions.get("window");
  return width < height ? "portrait" : "landscape";
};

/* ---------------------------------------------------------
 *  Storage Utilities (AsyncStorage)
 * --------------------------------------------------------- */
export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Error storing data:", err);
  }
};

export const getData = async <T = any>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue ? (JSON.parse(jsonValue) as T) : null;
  } catch (err) {
    console.error("Error retrieving data:", err);
    return null;
  }
};

/* ---------------------------------------------------------
 *  Navigation Utilities (React Navigation)
 * --------------------------------------------------------- */
export const resetNavigation = (navigation: any, routeName: string, params: Record<string, any> = {}) => {
  navigation.reset({
    index: 0,
    routes: [{ name: routeName, params }],
  });
};

/* ---------------------------------------------------------
 *  Debounce & Throttle Utilities
 * --------------------------------------------------------- */
export const debounce = <F extends (...args: any[]) => void>(func: F, wait: number): F => {
  let timeout: NodeJS.Timeout;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  } as F;
};

export const throttle = <F extends (...args: any[]) => void>(func: F, limit: number): F => {
  let inThrottle = false;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as F;
};

/* ---------------------------------------------------------
 *  Array & Object Utilities
 * --------------------------------------------------------- */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> =>
  array.reduce<Record<string, T[]>>((result, item: any) => {
    const val = item[key] as any;
    (result[val] = result[val] || []).push(item);
    return result;
  }, {});

export const sortBy = <T>(array: T[], key: keyof T, descending = false): T[] =>
  [...array].sort((a, b) => {
    if (a[key] === b[key]) return 0;
    return descending
      ? (b[key] as any) < (a[key] as any) ? -1 : 1
      : (a[key] as any) < (b[key] as any) ? -1 : 1;
  });

/* ---------------------------------------------------------
 *  Analytics (stub)
 * --------------------------------------------------------- */
export const trackEvent = async (eventName: string, properties: Record<string, any> = {}): Promise<void> => {
  try {
    console.log("Event tracked:", eventName, properties);
    // Optional: integrate with analytics SDK
  } catch (err) {
    console.error("Error tracking event:", err);
  }
};

/* ---------------------------------------------------------
 *  Performance Utilities
 * --------------------------------------------------------- */
export const measurePerformance = async <T>(operationName: string, operation: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  try {
    const result = await operation();
    console.log(`${operationName} took ${performance.now() - start}ms`);
    return result;
  } catch (err) {
    console.error(`${operationName} failed after ${performance.now() - start}ms:`, err);
    throw err;
  }
};