// src/components/common/CustomPicker.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface CustomPickerProps {
  value?: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  label,
  error,
  required,
}) => {
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find((option) => option === value);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {/* Label */}
      {label && (
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.medium as any,
            color: colors.text.primary,
            marginBottom: spacing.xs,
          }}
        >
          {label}
          {required && (
            <Text style={{ color: colors.error, fontWeight: "bold" }}> *</Text>
          )}
        </Text>
      )}

      {/* Picker Button */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: 48,
          paddingHorizontal: spacing.md,
          borderWidth: 1,
          borderColor: error ? colors.error : colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
        }}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={{
            fontSize: fontSize.md,
            color: selectedOption ? colors.text.primary : colors.text.light,
          }}
        >
          {selectedOption || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      {/* Error */}
      {error && (
        <Text
          style={{
            fontSize: fontSize.sm,
            marginTop: spacing.xs,
            color: colors.error,
          }}
        >
          {error}
        </Text>
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ padding: spacing.sm }}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: fontSize.lg,
                fontWeight: fontWeight.semibold as any,
                color: colors.text.primary,
              }}
            >
              {label || "Select Option"}
            </Text>
            <View style={{ width: 40 }} /> {/* for balance */}
          </View>

          {/* Search */}
          <TextInput
            style={{
              margin: spacing.md,
              paddingHorizontal: spacing.md,
              height: 42,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              backgroundColor: colors.background,
              fontSize: fontSize.md,
              color: colors.text.primary,
            }}
            placeholder="Search..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Options */}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const active = item === value;
              return (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: active
                      ? colors.primary + "15" // lightly tinted if selected
                      : "transparent",
                  }}
                  onPress={() => {
                    onChange(item);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={{
                      fontSize: fontSize.md,
                      color: active ? colors.primary : colors.text.primary,
                      fontWeight: active
                        ? fontWeight.medium as any
                        : fontWeight.regular as any,
                    }}
                  >
                    {item}
                  </Text>
                  {active && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default CustomPicker;