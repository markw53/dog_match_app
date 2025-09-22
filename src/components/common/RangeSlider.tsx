// src/components/common/RangeSlider.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useTheme } from "@/context/ThemeContext";

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface RangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  values?: number[]; // dual slider [min, max]
  value?: number; // single slider
  onValueChange?: (value: number) => void;
  onValuesChange?: (values: number[]) => void;
  prefix?: string;
  suffix?: string;
  sliderLength?: number;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  values,
  value,
  onValueChange,
  onValuesChange,
  prefix = "",
  suffix = "",
  sliderLength = 280,
}) => {
  const { colors, fontSize, fontWeight, shadows } = useTheme();

  const [currentValues, setCurrentValues] = useState(values || [value || min]);
  const isDual = Array.isArray(values);

  const handleValuesChange = useCallback(
    (newValues: number[]) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentValues(newValues);
      if (isDual) {
        onValuesChange?.(newValues);
      } else {
        onValueChange?.(newValues[0]);
      }
    },
    [isDual, onValuesChange, onValueChange]
  );

  // Themed custom marker
  const CustomMarker = () => (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: colors.surface,
        ...shadows.small,
      }}
    />
  );

  return (
    <View style={{ alignItems: "center", marginVertical: 10, width: "100%" }}>
      {/* Label with dynamic values */}
      <View style={{ marginBottom: 8 }}>
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.medium as any,
            color: colors.text.primary,
          }}
        >
          {prefix}
          {isDual
            ? `${currentValues[0]} - ${currentValues[1]}`
            : currentValues[0]}
          {suffix}
        </Text>
      </View>

      {/* Slider */}
      <MultiSlider
        values={currentValues}
        min={min}
        max={max}
        step={step}
        sliderLength={sliderLength}
        onValuesChange={handleValuesChange}
        customMarker={CustomMarker}
        selectedStyle={{
          backgroundColor: colors.primary,
          height: 4,
        }}
        unselectedStyle={{
          backgroundColor: colors.border,
          height: 4,
        }}
        containerStyle={{ height: 40 }}
        trackStyle={{ borderRadius: 2 }}
        markerContainerStyle={{ marginTop: 4 }}
        enabledOne={true}
        enabledTwo={isDual}
        minMarkerOverlapDistance={20}
      />

      {/* Min / Max Labels */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          marginTop: 5,
        }}
      >
        <Text
          style={{
            fontSize: fontSize.sm,
            color: colors.text.secondary,
          }}
        >
          {prefix}
          {min}
          {suffix}
        </Text>
        <Text
          style={{
            fontSize: fontSize.sm,
            color: colors.text.secondary,
          }}
        >
          {prefix}
          {max}
          {suffix}
        </Text>
      </View>
    </View>
  );
};

export default RangeSlider;