import { memo } from "react";
import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { UserSummary } from "@/modules/user/types";

type StartChatCardProps = {
  user: UserSummary;
  isCreating: boolean;
  onStart: (user: UserSummary) => void;
};

export const StartChatCard = memo(({ user, isCreating, onStart }: StartChatCardProps) => {
  const profile = user.profile;

  return (
    <Card className="mr-3 w-56">
      <CardContent className="gap-2 p-4">
        <Avatar name={profile.fullName} imageUrl={profile.avatarUrl ?? ""} size="md" fallback="mesh" />
        <AppText weight="medium" numberOfLines={1}>
          {profile.fullName || "Startuphouze member"}
        </AppText>
        <AppText tone="muted" size="xs" numberOfLines={2}>
          {profile.headline || profile.role || "Member"}
        </AppText>
        <AppButton label="Start chat" loading={isCreating} onPress={() => onStart(user)} size="sm" className="mt-2" />
      </CardContent>
    </Card>
  );
});

StartChatCard.displayName = "StartChatCard";
