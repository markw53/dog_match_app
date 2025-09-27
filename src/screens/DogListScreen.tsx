// src/screens/DogListScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
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
import { useThemedStyles } from "@/hooks/useThemedStyles";
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
  const theme = useTheme();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = useThemedStyles((t) => ({
    screen: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    listContent: {
      padding: t.spacing.md,
      paddingBottom: t.spacing.xxl,
    },
    dogImage: {
      width: 60,
      height: 60,
      borderRadius: t.radius.sm,
      marginRight: t.spacing.md,
      backgroundColor: t.colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    dogName: {
      ...t.typography.subtitle1,
      color: t.colors.text.primary,
    },
    breed: {
      ...t.typography.body2,
      color: t.colors.text.secondary,
    },
    mating: {
      ...t.typography.caption,
      color: t.colors.success,
      marginTop: 2,
    },
    emptyText: {
      ...t.typography.body1,
      color: t.colors.text.secondary,
      textAlign: "center",
      marginTop: t.spacing.xxl,
    },
    fab: {
      position: "absolute",
      bottom: t.spacing.xxl,
      right: t.spacing.xxl,
      backgroundColor: t.colors.primary,
      width: 56,
      height: 56,
      borderRadius: t.radius.lg,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },
  }));

  useEffect(() => {
    if (user) fetchDogs();
  }, [user]);

  // --- Fetch dogs
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
          <Image source={{ uri: item.imageUrl }} style={styles.dogImage} />
        ) : (
          <View style={styles.dogImage}>
            <Ionicons name="paw-outline" size={28} color={theme.colors.text.secondary} />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.dogName}>{item.name || "Unnamed Dog"}</Text>
          <Text style={styles.breed}>{item.breed || "Unknown breed"}</Text>
          {item.isAvailableForMating && (
            <Text style={styles.mating}>Available for mating 🐶❤️</Text>
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity onPress={() => deleteDog(item.id)} style={{ padding: 6 }}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={dogs}
        renderItem={renderDog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No dogs yet. Add one!</Text> : null
        }
      />

      {/* Floating add button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("DogProfile", { isNewDog: true })}
      >
        <Ionicons name="add" size={28} color={"#fff"} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}