// src/services/locationService.ts
import { db } from "@/config/firebaseConfig";
import {
  doc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import * as Location from "expo-location";
import { LOCATION_CONSTANTS } from "@/utils/constants";
import { calculateAge } from "@/utils";

// 🔹 Types
export interface Coordinates {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

export interface Address {
  street?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postalCode?: string | null;
  formattedAddress: string;
}

export interface LocationOptions {
  radius?: number;
  breed?: string;
  gender?: "male" | "female";
  minAge?: number;
  maxAge?: number;
  limit?: number;
}

export interface DogWithDistance {
  id: string;
  name: string;
  breed: string;
  gender?: "male" | "female";
  dateOfBirth?: string;
  location?: Coordinates;
  distance: number;
  [key: string]: any; // allow other Firestore fields
}

export const locationService = {
  // 🔹 Get user's current coordinates
  async getCurrentLocation(): Promise<Coordinates> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission denied");
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp,
    };
  },

  // 🔹 Update user location in Firestore
  async updateUserLocation(userId: string, location: Coordinates) {
    await updateDoc(doc(db, "users", userId), {
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        updatedAt: serverTimestamp(),
      },
    });
  },

  // 🔹 Update dog location in Firestore
  async updateDogLocation(dogId: string, location: Coordinates) {
    await updateDoc(doc(db, "dogs", dogId), {
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        updatedAt: serverTimestamp(),
      },
    });
  },

  // 🔹 Get nearby dogs from Firestore
  async getNearbyDogs(
    location: Coordinates,
    options: LocationOptions = {}
  ): Promise<DogWithDistance[]> {
    const {
      radius = LOCATION_CONSTANTS.DEFAULT_RADIUS,
      breed,
      gender,
      minAge,
      maxAge,
      limit = 20,
    } = options;

    let q = query(
      collection(db, "dogs"),
      where("isAvailableForMating", "==", true)
    );

    if (breed) {
      q = query(q, where("breed", "==", breed));
    }

    if (gender) {
      q = query(q, where("gender", "==", gender));
    }

    const snapshot = await getDocs(q);
    const dogs: DogWithDistance[] = [];

    snapshot.forEach((docSnap) => {
      const dogData = docSnap.data();
      if (dogData.location) {
        const distance = locationService.calculateDistance(
          location.latitude,
          location.longitude,
          dogData.location.latitude,
          dogData.location.longitude
        );

        if (distance <= radius) {
          const age = calculateAge(dogData.dateOfBirth);
          if (
            (!minAge || age >= minAge) &&
            (!maxAge || age <= maxAge)
          ) {
            dogs.push({
              id: docSnap.id,
              ...dogData,
              distance,
            } as DogWithDistance);
          }
        }
      }
    });

    dogs.sort((a, b) => a.distance - b.distance);
    return dogs.slice(0, limit);
  },

  // 🔹 Get geocode results (text search → lat/lng)
  async getLocationSuggestions(query: string): Promise<Coordinates[]> {
    const response = await Location.geocodeAsync(query);
    return response.map((loc) => ({
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));
  },

  // 🔹 Reverse geocode (lat/lng → address)
  async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<Address | null> {
    const response = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (response.length > 0) {
      const address = response[0];
      return {
        street: address.street,
        city: address.city,
        region: address.region,
        country: address.country,
        postalCode: address.postalCode,
        formattedAddress: [address.street, address.city, address.region, address.country]
          .filter(Boolean)
          .join(", "),
      };
    }
    return null;
  },

  // 🔹 Watch user location changes
  watchLocation(
    callback: (coords: Coordinates) => void,
    errorCallback: (err: Error) => void
  ) {
    return Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: LOCATION_CONSTANTS.LOCATION_UPDATE_INTERVAL,
        distanceInterval: LOCATION_CONSTANTS.DISTANCE_FILTER,
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
        });
      }
    ).catch(errorCallback);
  },

  // 🔹 Haversine distance in km
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // 🔹 Format distance into km or meters
  formatDistance(distance: number): string {
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${Math.round(distance)}km`;
  },

  // 🔹 Check if location permission was granted
  async checkLocationPermission(): Promise<boolean> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === "granted";
  },

  // 🔹 Request location permission
  async requestLocationPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  },
};

// Helper: convert degrees → radians
const toRad = (value: number): number => (value * Math.PI) / 180;