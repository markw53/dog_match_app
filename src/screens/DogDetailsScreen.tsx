// src/screens/DogDetailsScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { Header } from "@/components/Dog/DogHeader";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { useTheme } from "@/context/ThemeContext";  // ✅ new system
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { useAuth } from "@/context/AuthContext";

type DogDetailsScreenProps = {
  route: RouteProp<{ params: { dogId: string; ownerId: string } }, "params">;
  navigation: any;
};

export default function DogDetailsScreen({ route, navigation }: DogDetailsScreenProps) {
  const { theme } = { theme: useTheme() };   // ✅ new typed hook
  const { user } = useAuth();
  const { dogId, ownerId } = route.params;

  const [dog, setDog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Theme-aware styles 🎨
  const styles = useThemedStyles((t) => ({
    loading: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    infoTitle: {
      ...t.typography.h2,
      color: t.colors.text.primary,
      marginBottom: t.spacing.sm,
    },
    infoSubtitle: {
      ...t.typography.subtitle2,
      color: t.colors.text.secondary,
      marginBottom: t.spacing.sm,
    },
    paragraph: {
      ...t.typography.body1,
      color: t.colors.text.primary,
      marginTop: t.spacing.md,
    },
    status: {
      ...t.typography.subtitle1,
      marginBottom: t.spacing.sm,
    },
  }));

  // 🔥 Fetch dog data
  useEffect(() => {
    const fetchDog = async () => {
      try {
        setLoading(true);
        const ref = doc(db, "users", ownerId, "dogs", dogId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setDog(snap.data());
        } else {
          setDog(null);
        }
      } catch (e) {
        console.error("Error fetching dog:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDog();
  }, [dogId, ownerId]);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!dog) {
    return (
      <ScreenWrapper>
        <Text style={{ ...theme.typography.body1, color: theme.colors.error }}>
          Dog not found.
        </Text>
      </ScreenWrapper>
    );
  }

  const isOwner = user?.uid === ownerId;

  return (
    <ScreenWrapper scrollable>
      <Header
        dog={dog}
        isOwner={isOwner}
        onBack={() => navigation.goBack()}
        onEdit={
          isOwner ? () => navigation.navigate("DogProfile", { dogId, isNewDog: false }) : undefined
        }
        onDelete={isOwner ? () => console.log("delete dog") : undefined}
      />

      {/* Dog info */}
      <Card>
        <Text style={styles.infoTitle}>{dog.name}</Text>
        <Text style={styles.infoSubtitle}>
          {dog.breed} • {dog.gender?.toUpperCase()} • {dog.weight}kg
        </Text>
        {dog.temperament && (
          <Text style={styles.infoSubtitle}>Temperament: {dog.temperament}</Text>
        )}
        {dog.description && (
          <Text style={styles.paragraph}>{dog.description}</Text>
        )}
      </Card>

      {/* Status / Health */}
      <Card>
        <Text
          style={[
            styles.status,
            { color: dog.isAvailableForMating ? theme.colors.success : theme.colors.warning },
          ]}
        >
          {dog.isAvailableForMating ? "✅ Available for mating" : "❌ Not available for mating"}
        </Text>

        <Text style={styles.infoSubtitle}>
          Vaccinations:{" "}
          {dog.healthCertificates?.vaccinations ? "✔️ Up-to-date" : "❌ Missing"}
        </Text>
        <Text style={styles.infoSubtitle}>
          Health Check:{" "}
          {dog.healthCertificates?.healthCheck ? "✔️ Passed" : "❌ Pending"}
        </Text>
      </Card>

      {/* Non-owner actions */}
      {!isOwner && (
        <Card>
          <Button
            title="Contact Owner"
            onPress={() => console.log("contact owner")}
            fullWidth
            variant="primary"
          />
          <View style={{ height: theme.spacing.md }} />
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