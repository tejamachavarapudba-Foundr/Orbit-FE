import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { OnboardingMemberRole, ROLE_ACCENT_COLORS } from "@/constants/memberRoles";
import { useThemeStore } from "@/store/themeStore";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

type RoleCardProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  description: string;
  value: OnboardingMemberRole;
  selected: boolean;
  onSelect: (value: OnboardingMemberRole) => void;
};

export const RoleCard = ({ icon, label, description, value, selected, onSelect }: RoleCardProps) => {
  const colors = useThemeTokens();
  const scheme = useThemeStore((state) => state.resolvedScheme);
  const accent = ROLE_ACCENT_COLORS[value][scheme];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect(value)}
      className={
        selected
          ? "flex-row items-center gap-3 rounded-2xl border-2 border-primary bg-primary/5 p-3.5"
          : "flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3.5"
      }
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: accent.bg }}
      >
        <Feather name={icon} size={iconSize.lg} color={accent.icon} />
      </View>
      <View className="min-w-0 flex-1">
        <AppText weight="semibold" tone={selected ? "primary" : "default"}>
          {label}
        </AppText>
        <AppText tone="muted" size="sm" className="mt-0.5 leading-5">
          {description}
        </AppText>
      </View>
      {selected ? (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
          <Feather name="check" size={14} color={colors.onPrimary} />
        </View>
      ) : null}
    </Pressable>
  );
};
