// src/hooks/useHomeScreen.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { dogService } from "@/services/dogService";
import { matchService } from "@/services/matchService";
import { notificationService } from "@/services/notificationService";
import { locationService } from "@/services/locationService";

// Example Dog type (might exist already in your types folder)
export interface Dog {
  id: string;
  name: string;
  breed: string;
  age?: number;
  gender?: "male" | "female";
  description?: string;
  imageUrl?: string;
  isAvailableForMating?: boolean;
}

export interface Filters {
  breed?: string;
  ageRange?: [number, number];
  gender?: "male" | "female" | "any";
  [key: string]: any;
}

export const useHomeScreen = () => {
  const { user } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 🔹 Replace these with your actual service implementations
      const location = await locationService.getCurrentLocation();
      const [nearbyDogs, userMatches, notifications] = await Promise.all([
        dogService.getNearbyDogs(location, filters),
        matchService.getUserMatches(user.uid),
        notificationService.getUserNotifications(user.uid),
      ]);

      setDogs(nearbyDogs);
      // optionally: store matches or notifications in global state
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [filters, user, loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filtering: case-insensitive name or breed
  const filteredDogs = dogs.filter((dog) => {
    const q = searchQuery.toLowerCase();
    return (
      dog.name.toLowerCase().includes(q) ||
      dog.breed.toLowerCase().includes(q)
    );
  });

  return {
    dogs: filteredDogs,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    handleRefresh,
    loadData,
  };
};