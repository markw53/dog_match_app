// src/screens/DogDetailsScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { Header } from "@/components/Dog/DogHeader";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { matchService } from "@/services/matchService";

type DogDetailsScreenProps = {
  route: RouteProp<{ params: { dogId: string; ownerId: string } }, "params">;
};

interface Dog {
  id?: string;
  name: string;
  breed: string;
  gender?: "male" | "female";
  weight?: number;
  height?: number;
  temperament?: string;
  description?: string;
  isAvailableForMating?: boolean;
  healthCertificates?: {
    vaccinations?: boolean;
    healthCheck?: boolean;
  };
  photoURL?: string;
}

export default function DogDetailsScreen({ route }: DogDetailsScreenProps) {
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const { dogId, ownerId } = route.params;

  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Load dog document from owner subcollection: users/{ownerId}/dogs/{dogId}
  useEffect(() => {
    const fetchDog = async () => {
      try {
        setLoading(true);
        setError(null);

        const docRef = doc(db, "users", ownerId, "dogs", dogId);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setDog({ id: snap.id, ...snap.data() } as Dog);
        } else {
          setDog(null);
          setError("Dog not found.");
        }
      } catch (e: any) {
        console.error("Error fetching dog:", e);
        setError("Failed to load dog details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDog();
  }, [dogId, ownerId]);

  const isOwner = user?.uid === ownerId;

  const handleContactOwner = async () => {
    try {
      if (!user?.uid) return;
      const matchId = await matchService.createMatch(user.uid, ownerId); // match owner & viewer
      navigation.navigate("Chat", { matchId });
    } catch (err) {
      console.error("Error contacting owner:", err);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <Text style={[styles.errorText, { color: colors.error, fontSize: fontSize.md }]}>
          {error}
        </Text>
      </ScreenWrapper>
    );
  }

  if (!dog) return null;

  return (
    <ScreenWrapper scrollable>
      {/* Header with image + edit/delete if owner */}
      <Header
        dog={dog}
        isOwner={isOwner}
        onBack={() => navigation.goBack()}
        onEdit={
          isOwner
            ? () => navigation.navigate("DogProfile", { dogId, isNewDog: false })
            : undefined
        }
        onDelete={isOwner ? () => console.log("TODO: delete dog") : undefined}
      />

      {/* Dog Info Card */}
      <Card>
        <Text
          style={[
            styles.dogName,
            { fontSize: fontSize.xxl, fontWeight: fontWeight.bold as any, color: colors.text.primary },
          ]}
        >
          {dog.name}
        </Text>
        <Text
          style={[
            styles.dogMeta,
            { fontSize: fontSize.md, fontWeight: fontWeight.medium as any, color: colors.text.secondary },
          ]}
        >
          {dog.breed} • {dog.gender?.toUpperCase()} • {dog.weight}kg
        </Text>

        {dog.temperament && (
          <Text style={[styles.dogText, { color: colors.text.secondary }]}>
            Temperament: {dog.temperament}
          </Text>
        )}
        {dog.description && (
          <Text style={[styles.dogText, { marginTop: spacing.md, color: colors.text.primary }]}>
            {dog.description}
          </Text>
        )}
      </Card>

      {/* Availability + Health Info */}
      <Card>
        <Text
          style={[
            styles.statusText,
            {
              fontSize: fontSize.md,
              color: dog.isAvailableForMating ? colors.success : colors.warning,
            },
          ]}
        >
          {dog.isAvailableForMating ? "✅ Available for mating" : "❌ Not available for mating"}
        </Text>

        <Text style={[styles.healthText, { color: colors.text.secondary }]}>
          Vaccinations: {dog.healthCertificates?.vaccinations ? "✔️ Up-to-date" : "❌ Missing"}
        </Text>
        <Text style={[styles.healthText, { color: colors.text.secondary }]}>
          Health Check: {dog.healthCertificates?.healthCheck ? "✔️ Passed" : "❌ Pending"}
        </Text>
      </Card>

      {/* Non-owner actions */}
      {!isOwner && (
        <Card>
          <Button
            title="Contact Owner"
            onPress={handleContactOwner}
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

const styles = StyleSheet.create({
  errorText: {
    textAlign: "center",
  },
  dogName: {
    marginBottom: 8,
  },
  dogMeta: {
    marginBottom: 8,
  },
  dogText: {
    fontSize: 14,
  },
  statusText: {
    marginBottom: 8,
  },
  healthText: {
    marginBottom: 6,
  },
});