// src/screens/HomeScreen.tsx
import React, { useState } from "react";
import {
  View,
  RefreshControl,
  Animated,
  FlatList,
} from "react-native";
import { useHomeScreen } from "@/hooks/useHomeScreen";
import { useTheme } from "@/context/ThemeContext";
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { useAuth } from "@/context/AuthContext";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { DogCard } from "@/components/DogCard";
import { HomeHeader } from "@/components/Home/HomeHeader";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import EmptyState from "@/components/common/EmptyState";
import DogFilterModal from "@/components/DogFilterModal";
import FAB from "@/components/common/FAB";

import { matchService } from "@/services/matchService";

type Dog = {
  id: string;
  // extend later with Dog interface
};

import type { FlatListProps } from "react-native";

const ForwardedFlatList = React.forwardRef<FlatList<Dog>, FlatListProps<Dog>>(
  (props, ref) => <FlatList<Dog> {...props} ref={ref} />
);

const AnimatedFlatList = Animated.createAnimatedComponent(ForwardedFlatList);

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

  const theme = useTheme();
  const { user } = useAuth();

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const scrollY = new Animated.Value(0);

  // 🔹 Theme‑aware styles
  const styles = useThemedStyles((t) => ({
    listContent: {
      padding: t.spacing.md,
      paddingBottom: t.spacing.xxl * 2,
    },
  }));

  const handleContactDog = async (dogId: string) => {
    try {
      await matchService.createMatch(user?.uid, dogId, user?.uid); // adapt if you have myDog param
      navigation.navigate("Chat", { dogId });
    } catch (error) {
      console.error("Error contacting dog:", error);
    }
  };

  const renderDogCard = ({ item: dog, index }: { item: Dog; index: number }) => {
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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
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