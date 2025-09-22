// src/components/User/UserStats.tsx
import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import Card from "../common/Card";

interface UserStatsProps {
  stats?: {
    dogs?: number;
    matches?: number;
    messages?: number;
  };
}

export const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  const { colors, spacing, fontSize, fontWeight } = useTheme();

  const data = [
    { label: "Dogs", value: stats?.dogs || 0 },
    { label: "Matches", value: stats?.matches || 0 },
    { label: "Messages", value: stats?.messages || 0 },
  ];

  return (
    <Card variant="outlined" padding>
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        {data.map((item, i) => (
          <View key={i} style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: fontSize.xl,
                fontWeight: fontWeight.bold as any,
                color: colors.text.primary,
              }}
            >
              {item.value}
            </Text>
            <Text
              style={{
                fontSize: fontSize.sm,
                color: colors.text.secondary,
                marginTop: spacing.xs,
              }}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
};