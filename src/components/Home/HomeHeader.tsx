// src/components/Home/HomeHeader.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import SearchBar from "../common/SearchBar"; // assuming you have a custom themed SearchBar

interface HomeHeaderProps {
  searchQuery: string;
  onSearch: (text: string) => void;
  onFilterPress: () => void;
  dogsCount: number;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  searchQuery,
  onSearch,
  onFilterPress,
  dogsCount,
}) => {
  const { colors, spacing, fontSize, fontWeight, radius } = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* 🔍 Search + Filter Row */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={searchQuery}
            onChangeText={onSearch}
            placeholder="Search dogs..."
          />
        </View>
        <TouchableOpacity
          onPress={onFilterPress}
          style={{
            marginLeft: spacing.sm,
            padding: spacing.sm,
            borderRadius: radius.sm,
            backgroundColor: colors.primary + "15",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="filter" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 📊 Stats Row */}
      <View
        style={{
          marginTop: spacing.sm,
        }}
      >
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.medium as any,
            color: colors.text.secondary,
          }}
        >
          {dogsCount} dogs available
        </Text>
      </View>
    </View>
  );
};