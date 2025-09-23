// src/screens/MatchFeedScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import Swiper from "react-native-deck-swiper";   // 👈 Updated import
import { collectionGroup, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

const { width } = Dimensions.get("window");

interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed?: string;
  age?: number;
  temperament?: string;
  imageUrl?: string;
  isAvailableForMating?: boolean;
}

export default function MatchFeedScreen() {
  const { user } = useAuth();
  const { colors, spacing, fontSize, fontWeight } = useTheme();

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllDogs();
  }, []);

  const fetchAllDogs = async () => {
    try {
      setLoading(true);
      // ✅ collectionGroup: fetch dogs across all users
      const snapshot = await getDocs(collectionGroup(db, "dogs"));
      const dogList: Dog[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Dog;
        if (data.ownerId !== user?.uid) {
          dogList.push({ id: docSnap.id, ...data });
        }
      });
      setDogs(dogList);
    } catch (error) {
      console.error("Error fetching dogs for matchmaking:", error);
    } finally {
      setLoading(false);
    }
  };

  // Swipe handlers
  const onSwipeRight = (cardIndex: number) => {
    const dog = dogs[cardIndex];
    console.log("❤️ Liked:", dog?.name);
    // TODO: Firestore - add to likes
  };

  const onSwipeLeft = (cardIndex: number) => {
    const dog = dogs[cardIndex];
    console.log("❌ Passed:", dog?.name);
    // TODO: Firestore - add to passes
  };

  // Card renderer
  const renderCard = (dog: Dog | null) => {
    if (!dog) return null;
    return (
      <Card style={{ width: width * 0.85, alignSelf: "center" }}>
        <Image
          source={
            dog.imageUrl
              ? { uri: dog.imageUrl }
              : require("../assets/default-dog.png")
          }
          style={{
            width: "100%",
            height: 280,
            borderRadius: 12,
            marginBottom: spacing.md,
          }}
          resizeMode="cover"
        />
        <View>
          <Text
            style={{
              fontSize: fontSize.xl,
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
              color: colors.text.secondary,
              marginBottom: spacing.sm,
            }}
          >
            {dog.breed} {dog.age ? `• ${dog.age} y/o` : ""}
          </Text>
          {dog.temperament && (
            <Text
              style={{
                fontSize: fontSize.sm,
                color: colors.text.secondary,
              }}
            >
              Temperament: {dog.temperament}
            </Text>
          )}
          {dog.isAvailableForMating && (
            <Text
              style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.medium as any,
                color: colors.success,
                marginTop: spacing.sm,
              }}
            >
              ✅ Available for Mating
            </Text>
          )}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (dogs.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.text.secondary, fontSize: fontSize.lg }}>
          No dogs available right now 🐾
        </Text>
        <Button
          title="Refresh"
          onPress={fetchAllDogs}
          variant="primary"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: spacing.lg }}>
      <Swiper
        cards={dogs}
        renderCard={renderCard}
        onSwipedLeft={onSwipeLeft}
        onSwipedRight={onSwipeRight}
        stackSize={3}
        infinite
        backgroundColor="transparent"
        cardVerticalMargin={spacing.md}
        cardIndex={0}
        animateCardOpacity
        overlayLabels={{
          left: {
            title: "NOPE",
            style: {
              label: {
                color: colors.error,
                fontSize: fontSize.xl,
                fontWeight: fontWeight.bold as any,
              },
            },
          },
          right: {
            title: "LIKE",
            style: {
              label: {
                color: colors.success,
                fontSize: fontSize.xl,
                fontWeight: fontWeight.bold as any,
              },
            },
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});