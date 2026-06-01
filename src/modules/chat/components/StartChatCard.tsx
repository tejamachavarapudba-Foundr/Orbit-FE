import { memo } from "react";
import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { UserAvatar } from "@/modules/user/components/UserAvatar";
import { UserSummary } from "@/modules/user/types";

type StartChatCardProps = {
  user: UserSummary;
  isCreating: boolean;
  onStart: (user: UserSummary) => void;
};

export const StartChatCard = memo(({ user, isCreating, onStart }: StartChatCardProps) => {
  const profile = user.profile;

  return (
    <View className="mr-3 w-64 rounded-md border border-border bg-surface p-4 shadow-sm">
      <UserAvatar name={profile.fullName} imageUrl={profile.avatarUrl} />
      <AppText weight="bold" className="mt-3">
        {profile.fullName || "Startuphouze member"}
      </AppText>
      <AppText tone="muted" size="sm" className="mt-1">
        {profile.headline || profile.role || "Member"}
      </AppText>
      <AppButton label="Start chat" loading={isCreating} onPress={() => onStart(user)} className="mt-4 h-10" />
    </View>
  );
});

StartChatCard.displayName = "StartChatCard";
