import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";
import { iconSize } from "@/theme/designTokens";

type ComposerPromptCardProps = {
  onPress: () => void;
};

const quickActions: { label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { label: "Photo", icon: "image" },
  { label: "Video", icon: "video" },
  { label: "Link", icon: "link" },
];

export const ComposerPromptCard = ({ onPress }: ComposerPromptCardProps) => {
  const colors = useThemeTokens();
  const user = useAuthStore((state) => state.user);

  return (
    <View className="border-b border-border bg-card px-4 py-3">
      <Pressable accessibilityRole="button" onPress={onPress} className="flex-row items-center gap-3">
        <Avatar name={user?.profile.fullName ?? "You"} imageUrl={user?.profile.avatarUrl ?? ""} size="md" fallback="mesh" />
        <View className="h-10 flex-1 justify-center rounded-full border border-border px-4">
          <AppText tone="muted">Start a post</AppText>
        </View>
      </Pressable>

      <View className="mt-3 flex-row justify-between">
        {quickActions.map((action) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            onPress={onPress}
            className="flex-1 flex-row items-center justify-center gap-2 py-1.5"
          >
            <Feather name={action.icon} size={iconSize.md} color={colors.muted} />
            <AppText size="sm" tone="muted" weight="medium">
              {action.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
