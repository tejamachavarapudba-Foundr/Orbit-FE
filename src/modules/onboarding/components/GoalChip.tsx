import { Pressable } from "react-native";

import { AppText } from "@/components/ui/AppText";

type GoalChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export const GoalChip = ({ label, selected, onPress }: GoalChipProps) => {
  if (selected) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} className="rounded-full border border-primary bg-primary px-4 py-2">
        <AppText tone="onPrimary" size="sm" weight="medium">
          {label}
        </AppText>
      </Pressable>
    );
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="rounded-full border border-border bg-surface px-4 py-2">
      <AppText tone="muted" size="sm" weight="medium">
        {label}
      </AppText>
    </Pressable>
  );
};
