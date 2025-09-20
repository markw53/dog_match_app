// src/screens/DogListScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useTheme } from "@/context/ThemeContext";
import Card from "@/components/common/Card";

interface Dog {
  id: string;
  name: string;
  breed: string;
  imageUrl?: string;
  isAvailableForMating?: boolean;
}

export default function DogListScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors, spacing, radius, fontSize, shadows } = useTheme();

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDogs();
  }, [user]);

  // --- Fetch all dogs for logged-in user
  const fetchDogs = async () => {
    try {
      setLoading(true);
      const colRef = collection(db, "users", user!.uid, "dogs");
      const q = query(colRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Dog)
      );
      setDogs(list);
    } catch (error) {
      console.error("Error fetching dogs: ", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Delete dog
  const deleteDog = (dogId: string) => {
    Alert.alert("Delete Dog", "Are you sure you want to delete this profile?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "users", user!.uid, "dogs", dogId));
            setDogs((prev) => prev.filter((d) => d.id !== dogId));
          } catch (error) {
            console.error("Error deleting dog:", error);
            Alert.alert("Error", "Failed to delete dog profile");
          }
        },
      },
    ]);
  };

  const renderDog = ({ item }: { item: Dog }) => (
    <Card
      variant="outlined"
      onPress={() =>
        navigation.navigate("DogProfile", { dogId: item.id, isNewDog: false })
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{
              width: 60,
              height: 60,
              borderRadius: radius.sm,
              marginRight: spacing.md,
            }}
          />
        ) : (
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: radius.sm,
              marginRight: spacing.md,
              backgroundColor: colors.background,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="paw-outline" size={28} color={colors.text.secondary} />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: fontSize.md,
              fontWeight: "600",
              color: colors.text.primary,
            }}
          >
            {item.name || "Unnamed Dog"}
          </Text>
          <Text
            style={{ fontSize: fontSize.sm, color: colors.text.secondary }}
          >
            {item.breed || "Unknown breed"}
          </Text>
          {item.isAvailableForMating && (
            <Text
              style={{
                fontSize: fontSize.sm,
                color: colors.success,
                marginTop: 2,
              }}
            >
              Available for mating 🐶❤️
            </Text>
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity onPress={() => deleteDog(item.id)} style={{ padding: 6 }}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={dogs}
        renderItem={renderDog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xxl,
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: "center", marginTop: spacing.xxl }}>
              <Text style={{ fontSize: fontSize.md, color: colors.text.secondary }}>
                No dogs yet. Add one!
              </Text>
            </View>
          ) : null
        }
      />

      {/* Floating add button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: spacing.xxl,
          right: spacing.xxl,
          backgroundColor: colors.primary,
          width: 56,
          height: 56,
          borderRadius: radius.round,
          justifyContent: "center",
          alignItems: "center",
          ...shadows.medium,
        }}
        onPress={() => navigation.navigate("DogProfile", { isNewDog: true })}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}