import { Pressable } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { getShadowStyle } from "@/theme/shadows";

type FilterChipProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
  activeTone?: "card" | "primary";
};

/** NativeWind-safe filter chip with static class names per state. */
export const FilterChip = ({ label, isActive, onPress, activeTone = "card" }: FilterChipProps) => {
  if (isActive && activeTone === "primary") {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="rounded-md border border-primary bg-primary px-4 py-2"
      >
        <AppText tone="onPrimary" size="sm" weight="medium">
          {label}
        </AppText>
      </Pressable>
    );
  }

  if (isActive) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="rounded-md border border-border bg-card px-4 py-2"
        style={getShadowStyle("card")}
      >
        <AppText size="sm" weight="medium">
          {label}
        </AppText>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="rounded-md border border-border bg-card px-4 py-2"
    >
      <AppText tone="muted" size="sm" weight="medium">
        {label}
      </AppText>
    </Pressable>
  );
};
