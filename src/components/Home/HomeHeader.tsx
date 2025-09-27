// src/components/Home/HomeHeader.tsx
import React from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { useTheme } from "@/context/ThemeContext";

interface HomeHeaderProps {
  searchQuery: string;
  onSearch: (text: string) => void;
  onFilterPress: () => void;
  dogsCount: number;
}

export const HomeHeader = ({
  searchQuery,
  onSearch,
  onFilterPress,
  dogsCount,
}: HomeHeaderProps) => {
  const theme = useTheme();
  const styles = useThemedStyles((t) => ({
    container: {
      padding: t.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.surface,
      backgroundColor: t.colors.background,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.md,
      paddingHorizontal: t.spacing.sm,
      marginBottom: t.spacing.sm,
    },
    searchInput: {
      flex: 1,
      ...t.typography.body1,
      color: t.colors.text.primary,
      paddingVertical: t.spacing.sm,
      marginLeft: t.spacing.sm,
    },
    filterButton: {
      marginLeft: t.spacing.sm,
      padding: t.spacing.sm,
    },
    dogsCount: {
      ...t.typography.body2,
      color: t.colors.text.secondary,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={20} color={theme.colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dogs..."
          placeholderTextColor={theme.colors.text.disabled}
          value={searchQuery}
          onChangeText={onSearch}
        />
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
          <Ionicons name="filter-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.dogsCount}>{dogsCount} dogs found</Text>
    </View>
  );
};