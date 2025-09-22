// src/components/DogFilterModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { DOG_BREEDS } from "@/utils/constants/index";
import { useTheme } from "@/context/ThemeContext";

// Components
import CustomPicker from "@/components/common/CustomPicker";
import CustomSwitch from "@/components/common/CustomSwitch";
import RangeSlider from "@/components/common/RangeSlider";
import Button from "@/components/common/Button";
import FormFieldWrapper from "@/components/common/FormFieldWrapper";

type DogFilterModalProps = {
  visible: boolean;
  currentFilters?: {
    breed?: string;
    gender?: string;
    ageRange?: [number, number];
    availableOnly?: boolean;
    distance?: number;
    [key: string]: any;
  };
  onApply: (filters: {
    breed: string;
    gender: string;
    ageRange: [number, number];
    availableOnly: boolean;
    distance: number;
    [key: string]: any;
  }) => void;
  onClose: () => void;
};

export default function DogFilterModal({
  visible,
  currentFilters,
  onApply,
  onClose,
}: DogFilterModalProps) {
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();

  const [filters, setFilters] = useState<{
    breed: string;
    gender: string;
    ageRange: [number, number];
    availableOnly: boolean;
    distance: number;
    [key: string]: any;
  }>({
    breed: "",
    gender: "",
    ageRange: [0, 15],
    availableOnly: false,
    distance: 50,
    ...currentFilters,
  });

  useEffect(() => {
    setFilters({
      breed: "",
      gender: "",
      ageRange: [0, 15],
      availableOnly: false,
      distance: 50,
      ...currentFilters,
    });
  }, [currentFilters]);

  const handleReset = () => {
    setFilters({
      breed: "",
      gender: "",
      ageRange: [0, 15],
      availableOnly: false,
      distance: 50,
    });
  };

  const handleApply = () => {
    onApply(filters);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            marginTop: spacing.xl,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
          }}
        >
          {/* 🔹 Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: fontSize.lg,
                fontWeight: fontWeight.semibold as any,
                color: colors.text.primary,
              }}
            >
              Filters
            </Text>
            <TouchableOpacity onPress={handleReset}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: fontSize.md,
                  fontWeight: fontWeight.medium as any,
                }}
              >
                Reset
              </Text>
            </TouchableOpacity>
          </View>

          {/* 🔹 Filter Options */}
          <ScrollView contentContainerStyle={{ padding: spacing.md }}>
            
            {/* Breed */}
            <FormFieldWrapper label="Breed">
              <CustomPicker
                value={filters.breed}
                onChange={(value) => setFilters({ ...filters, breed: value })}
                options={[...DOG_BREEDS]}
                placeholder="Select breed"
              />
            </FormFieldWrapper>

            {/* Gender */}
            <FormFieldWrapper label="Gender">
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {["male", "female"].map((g) => {
                  const active = filters.gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setFilters({ ...filters, gender: g })}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "48%",
                        padding: spacing.md,
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: colors.primary,
                        backgroundColor: active
                          ? colors.primary
                          : colors.surface,
                      }}
                    >
                      <Ionicons
                        name={g === "male" ? "male" : "female"}
                        size={22}
                        color={active ? colors.white : colors.primary}
                      />
                      <Text
                        style={{
                          marginLeft: spacing.sm,
                          fontSize: fontSize.md,
                          fontWeight: fontWeight.medium as any,
                          color: active ? colors.white : colors.primary,
                        }}
                      >
                        {g === "male" ? "Male" : "Female"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </FormFieldWrapper>

            {/* Age Range */}
            <FormFieldWrapper label="Age Range (yrs)">
              <RangeSlider
                values={filters.ageRange}
                onValuesChange={(vals) =>
                  setFilters({ ...filters, ageRange: [vals[0] ?? 0, vals[1] ?? 0] })
                }
                min={0}
                max={15}
                step={1}
              />
            </FormFieldWrapper>

            {/* Distance */}
            <FormFieldWrapper label="Distance (km)">
              <RangeSlider
                value={filters.distance}
                onValueChange={(v) =>
                  setFilters({ ...filters, distance: v })
                }
                min={1}
                max={100}
                step={1}
              />
            </FormFieldWrapper>

            {/* Available Only */}
            <FormFieldWrapper
              label="Show Available Only"
              description="Only show dogs marked available for mating"
            >
              <CustomSwitch
                label="Show Available Only"
                value={filters.availableOnly}
                onValueChange={(val) =>
                  setFilters({ ...filters, availableOnly: val })
                }
              />
            </FormFieldWrapper>
          </ScrollView>

          {/* 🔹 Footer Apply */}
          <View
            style={{
              padding: spacing.md,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Button title="Apply Filters" onPress={handleApply} fullWidth />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}