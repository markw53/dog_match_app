// src/screens/MatchesScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Card from "../components/common/Card";

interface Match {
  id: string;
  dog1Id: string;
  dog2Id: string;
  dog1Owner: string;
  dog2Owner: string;
  participants: string[];
  createdAt: any;
}

export default function MatchesScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors, fontSize, spacing, fontWeight } = useTheme();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const matchesRef = collection(db, "matches");
      const q = query(matchesRef, where("dog1Owner", "==", user.uid));
      const q2 = query(matchesRef, where("dog2Owner", "==", user.uid));

      // For now we'll just get all matches and filter
      const snap = await getDocs(matchesRef);
      const list: Match[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Match;
        if (data.dog1Owner === user.uid || data.dog2Owner === user.uid) {
          list.push({ id: docSnap.id, ...data });
        }
      });
      setMatches(list);
    } catch (e) {
      console.error("Error fetching matches:", e);
    } finally {
      setLoading(false);
    }
  };

  const renderMatch = ({ item }: { item: Match }) => {
    const otherDogId = item.dog1Owner === user.uid ? item.dog2Id : item.dog1Id;
    return (
      <Card
        variant="outlined"
        onPress={() => navigation.navigate("Chat", { matchId: item.id })}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 50,
              height: 50,
              backgroundColor: colors.background,
              borderRadius: 25,
              justifyContent: "center",
              alignItems: "center",
              marginRight: spacing.md,
            }}
          >
            <Ionicons name="paw-outline" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: fontSize.md,
                fontWeight: fontWeight.bold as any,
                color: colors.text.primary,
              }}
            >
              Dog Match ({otherDogId})
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm }}>
              Tap to chat with owner
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.md }}>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !loading && (
            <Text style={{ color: colors.text.secondary, textAlign: "center", marginTop: spacing.xl }}>
              No matches yet 🐾
            </Text>
          )
        }
      />
    </View>
  );
}