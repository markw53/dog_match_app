// src/screens/DogDetailsScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

import ScreenWrapper from "../components/layout/ScreenWrapper";
import { DogHeader } from "../components/Dog/DogHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

type DogDetailsScreenProps = {
  route: RouteProp<{ params: { dogId: string; ownerId: string } }, "params">;
  navigation: any;
};

export default function DogDetailsScreen({ route, navigation }: DogDetailsScreenProps) {
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  const { user } = useAuth();

  const { dogId, ownerId } = route.params;

  const [dog, setDog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Load dog document from owner subcollection: users/{ownerId}/dogs/{dogId}
  useEffect(() => {
    const fetchDog = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "users", ownerId, "dogs", dogId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setDog(snap.data());
        }
      } catch (e) {
        console.error("Error fetching dog:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDog();
  }, [dogId]);

  if (loading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenWrapper>
    );
  }

  if (!dog) {
    return (
      <ScreenWrapper>
        <Text style={{ color: colors.error, fontSize: fontSize.md }}>
          Dog not found.
        </Text>
      </ScreenWrapper>
    );
  }

  const isOwner = user?.uid === ownerId;

  return (
    <ScreenWrapper scrollable>
      {/* Header with image + edit/delete if owner */}
      <DogHeader
        dog={dog}
        isOwner={isOwner}
        onBack={() => navigation.goBack()}
        onEdit={
          isOwner
            ? () => navigation.navigate("DogProfile", { dogId, isNewDog: false })
            : undefined
        }
        onDelete={isOwner ? () => console.log("delete dog") : undefined}
      />

      {/* Dog Info Card */}
      <Card>
        <Text
          style={{
            fontSize: fontSize.xxl,
            fontWeight: fontWeight.bold as any,
            color: colors.text.primary,
            marginBottom: spacing.sm,
          }}
        >
          {dog.name}
        </Text>
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.medium as any,
            color: colors.text.secondary,
            marginBottom: spacing.sm,
          }}
        >
          {dog.breed} • {dog.gender?.toUpperCase()} • {dog.weight}kg
        </Text>
        {dog.temperament && (
          <Text style={{ fontSize: fontSize.md, color: colors.text.secondary }}>
            Temperament: {dog.temperament}
          </Text>
        )}
        {dog.description && (
          <Text
            style={{
              marginTop: spacing.md,
              fontSize: fontSize.md,
              color: colors.text.primary,
            }}
          >
            {dog.description}
          </Text>
        )}
      </Card>

      {/* Availability + Health Info */}
      <Card>
        {dog.isAvailableForMating ? (
          <Text
            style={{
              fontSize: fontSize.md,
              color: colors.success,
              marginBottom: spacing.sm,
            }}
          >
            ✅ Available for mating
          </Text>
        ) : (
          <Text
            style={{
              fontSize: fontSize.md,
              color: colors.warning,
              marginBottom: spacing.sm,
            }}
          >
            ❌ Not available for mating
          </Text>
        )}

        <Text
          style={{
            fontSize: fontSize.md,
            color: colors.text.secondary,
            marginBottom: spacing.sm,
          }}
        >
          Vaccinations:{" "}
          {dog.healthCertificates?.vaccinations ? "✔️ Up-to-date" : "❌ Missing"}
        </Text>
        <Text
          style={{
            fontSize: fontSize.md,
            color: colors.text.secondary,
          }}
        >
          Health Check:{" "}
          {dog.healthCertificates?.healthCheck ? "✔️ Passed" : "❌ Pending"}
        </Text>
      </Card>

      {/* Owner Actions */}
      {!isOwner && (
        <Card>
          <Button
            title="Contact Owner"
            onPress={() => console.log("contact owner")}
            fullWidth
            variant="primary"
          />
          <View style={{ height: spacing.md }} />
          <Button
            title="Request Mating"
            onPress={() => console.log("request mating")}
            fullWidth
            variant="secondary"
          />
        </Card>
      )}
    </ScreenWrapper>
  );
}