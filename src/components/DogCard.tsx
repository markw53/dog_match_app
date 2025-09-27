// src/components/DogCard.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { useTheme } from "@/context/ThemeContext";

interface Dog {
  id: string;
  name: string;
  breed?: string;
  description?: string;
  imageUrl?: string;
}

type DogCardProps = {
  dog: Dog;
  scale?: Animated.AnimatedInterpolation<number>;
  onPress?: () => void;
  onContact?: () => void;
};

export const DogCard = ({ dog, scale, onPress, onContact }: DogCardProps) => {
  const theme = useTheme();
  const styles = useThemedStyles((t) => ({
    container: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.md,
      marginBottom: t.spacing.md,
      padding: t.spacing.md,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
      transform: scale ? [{ scale }] : undefined,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: t.radius.sm,
      marginRight: t.spacing.md,
      backgroundColor: t.colors.background,
    },
    name: {
      ...t.typography.h3,
      color: t.colors.text.primary,
    },
    breed: {
      ...t.typography.subtitle2,
      color: t.colors.text.secondary,
    },
    description: {
      ...t.typography.body2,
      color: t.colors.text.secondary,
      marginTop: t.spacing.xs,
    },
    contactButton: {
      marginTop: t.spacing.sm,
      paddingVertical: t.spacing.sm,
      backgroundColor: t.colors.primary,
      borderRadius: t.radius.sm,
      justifyContent: "center",
      alignItems: "center",
    },
    contactText: {
      ...t.typography.button,
      color: "#fff",
    },
  }));

  return (
    <Animated.View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.row}>
          {dog.imageUrl ? (
            <Image source={{ uri: dog.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.image} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{dog.name}</Text>
            <Text style={styles.breed}>{dog.breed}</Text>
            {dog.description && <Text style={styles.description}>{dog.description}</Text>}
          </View>
        </View>
      </TouchableOpacity>

      {onContact && (
        <TouchableOpacity style={styles.contactButton} onPress={onContact}>
          <Text style={styles.contactText}>Contact Owner</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};