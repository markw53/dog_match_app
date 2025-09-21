// src/screens/HomeScreen.tsx
import React, { useState } from "react";
import {
  View,
  RefreshControl,
  Animated,
  FlatList,
} from "react-native";
import { useHomeScreen } from "../hooks/useHomeScreen";
import { useTheme } from "../context/ThemeContext";

import ScreenWrapper from "../components/layout/ScreenWrapper";
import { DogCard } from "../components/DogCard";
import { HomeHeader } from "../components/Home/HomeHeader";
import LoadingOverlay from "../components/common/LoadingOverlay";
import EmptyState from "../components/common/EmptyState";
import DogFilterModal from "../components/Home/DogFilterModal";
import FAB from "../components/common/FAB"; // Assuming you have a reusable FAB

import { matchService } from "../services/matchService";
import { useAuth } from "../context/AuthContext";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function HomeScreen({ navigation }: any) {
  const {
    dogs,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    handleRefresh,
  } = useHomeScreen();

  const { colors, spacing } = useTheme();
  const { user } = useAuth();

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const scrollY = new Animated.Value(0);

  const handleContactDog = async (dogId: string) => {
    try {
      await matchService.createMatch(user?.uid, dogId);
      navigation.navigate("Chat", { dogId });
    } catch (error) {
      console.error("Error contacting dog:", error);
    }
  };

  const renderDogCard = ({ item: dog, index }: any) => {
    const scale = scrollY.interpolate({
      inputRange: [-1, 0, index * 290, (index + 1) * 290],
      outputRange: [1, 1, 1, 0.85],
      extrapolate: "clamp",
    });

    return (
      <DogCard
        dog={dog}
        scale={scale}
        onPress={() =>
          navigation.navigate("DogProfile", {
            dogId: dog.id,
            dogData: dog,
          })
        }
        onContact={() => handleContactDog(dog.id)}
      />
    );
  };

  if (loading && !refreshing) {
    return <LoadingOverlay />;
  }

  return (
    <ScreenWrapper safe scrollable={false} padding={false}>
      {/* 🔹 Header */}
      <HomeHeader
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onFilterPress={() => setFilterModalVisible(true)}
        dogsCount={dogs.length}
      />

      {/* 🔹 Animated List of Dogs */}
      <AnimatedFlatList
        data={dogs}
        renderItem={renderDogCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xxl * 2,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="paw-outline"
            title="No Dogs Found"
            message="Try adjusting your filters or search"
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      />

      {/* 🔹 Filter Modal */}
      <DogFilterModal
        visible={filterModalVisible}
        currentFilters={filters}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setFilterModalVisible(false);
        }}
        onClose={() => setFilterModalVisible(false)}
      />

      {/* 🔹 FAB for adding new dog */}
      <FAB
        icon="add"
        onPress={() =>
          navigation.navigate("Dogs", {
            screen: "DogProfile",
            params: { isNewDog: true },
          })
        }
      />
    </ScreenWrapper>
  );
}