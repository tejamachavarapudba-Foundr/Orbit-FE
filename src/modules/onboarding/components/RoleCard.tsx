import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { OnboardingMemberRole } from "@/constants/memberRoles";
import { getShadowStyle } from "@/theme/shadows";

type RoleCardProps = {
  emoji: string;
  label: string;
  description: string;
  value: OnboardingMemberRole;
  selected: boolean;
  onSelect: (value: OnboardingMemberRole) => void;
};

export const RoleCard = ({ emoji, label, description, value, selected, onSelect }: RoleCardProps) => {
  if (selected) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: true }}
        onPress={() => onSelect(value)}
        className="rounded-xl border-2 border-primary bg-primary/5 p-4"
        style={getShadowStyle("card")}
      >
        <RoleCardContent emoji={emoji} label={label} description={description} selected />
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: false }}
      onPress={() => onSelect(value)}
      className="rounded-xl border border-border bg-surface p-4"
    >
      <RoleCardContent emoji={emoji} label={label} description={description} selected={false} />
    </Pressable>
  );
};

const RoleCardContent = ({
  emoji,
  label,
  description,
  selected
}: {
  emoji: string;
  label: string;
  description: string;
  selected: boolean;
}) => (
  <View className="flex-row items-center gap-3">
    <AppText size="2xl">{emoji}</AppText>
    <View className="flex-1">
      <AppText weight="bold" tone={selected ? "primary" : "default"}>
        {label}
      </AppText>
      <AppText tone="muted" size="sm" className="mt-1 leading-5">
        {description}
      </AppText>
    </View>
  </View>
);
