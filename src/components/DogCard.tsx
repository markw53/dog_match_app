// src/components/DogCard.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

interface Dog {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  temperament?: string;
  description?: string;
  imageUrl?: string;
  isAvailableForMating?: boolean;
}

interface DogCardProps {
  dog: Dog;
  scale?: Animated.AnimatedInterpolation<string | number>;
  onPress: () => void;
  onContact: () => void;
}

export const DogCard: React.FC<DogCardProps> = ({ dog, scale, onPress, onContact }) => {
  const { colors, spacing, fontSize, fontWeight, radius } = useTheme();

  return (
    <Animated.View style={{ transform: scale ? [{ scale }] : [] }}>
      <Card variant="elevated" onPress={onPress} style={{ padding: 0 }}>
        {/* Dog Image */}
        <Image
          source={
            dog.imageUrl
              ? { uri: dog.imageUrl }
              : require("../assets/default-dog.png")
          }
          style={{
            width: "100%",
            height: 180,
            borderTopLeftRadius: radius.md,
            borderTopRightRadius: radius.md,
          }}
          resizeMode="cover"
        />

        {/* Content */}
        <View style={{ padding: spacing.md }}>
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.bold as any,
              color: colors.text.primary,
              marginBottom: spacing.xs,
            }}
          >
            {dog.name}
          </Text>

          <Text
            style={{
              fontSize: fontSize.md,
              fontWeight: fontWeight.medium as any,
              color: colors.text.secondary,
              marginBottom: spacing.xs,
            }}
          >
            {dog.breed ? `${dog.breed}` : "Unknown Breed"}
            {dog.age ? ` • ${dog.age} yrs` : ""}
          </Text>

          {dog.temperament && (
            <Text
              numberOfLines={1}
              style={{
                fontSize: fontSize.sm,
                color: colors.text.secondary,
                marginBottom: spacing.sm,
              }}
            >
              Temperament: {dog.temperament}
            </Text>
          )}

          {dog.description && (
            <Text
              numberOfLines={2}
              style={{
                fontSize: fontSize.sm,
                color: colors.text.light,
                marginBottom: spacing.md,
              }}
            >
              {dog.description}
            </Text>
          )}

          {/* Availability */}
          {dog.isAvailableForMating ? (
            <View style={stylesRow}>
              <Ionicons name="heart" size={16} color={colors.success} />
              <Text
                style={{
                  marginLeft: spacing.xs,
                  fontSize: fontSize.sm,
                  color: colors.success,
                  fontWeight: fontWeight.medium as any,
                }}
              >
                Available for Mating
              </Text>
            </View>
          ) : (
            <View style={stylesRow}>
              <Ionicons name="close-circle" size={16} color={colors.error} />
              <Text
                style={{
                  marginLeft: spacing.xs,
                  fontSize: fontSize.sm,
                  color: colors.error,
                }}
              >
                Not Available
              </Text>
            </View>
          )}

          {/* Contact Button */}
          <View style={{ marginTop: spacing.md }}>
            <Button
              title="Contact Owner"
              onPress={onContact}
              variant="primary"
              fullWidth
              size="small"
              icon="chatbox-ellipses-outline"
            />
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

const stylesRow = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
};