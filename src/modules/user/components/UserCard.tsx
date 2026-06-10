import { memo } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { ConnectButton } from "@/modules/connections/components/ConnectButton";
import { ConnectionCountLabel } from "@/modules/connections/components/ConnectionCountLabel";
import { UserAvatar } from "@/modules/user/components/UserAvatar";
import { UserSummary } from "@/modules/user/types";

type UserCardProps = {
  user: UserSummary;
  onPress: (id: string) => void;
  showFollowButton?: boolean;
};

const formatRole = (role: string) => {
  if (!role.trim()) {
    return "Other";
  }

  return role
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const UserCard = memo(({ user, onPress, showFollowButton = false }: UserCardProps) => {
  const profile = user.profile;
  const company = profile.company.trim();
  const location = profile.location.trim();
  const skill = profile.skills[0];

  return (
    <View className="rounded-md border border-border bg-surface p-4 shadow-sm">
      <Pressable accessibilityRole="button" onPress={() => onPress(user.id)}>
        <View className="flex-row gap-3">
          <UserAvatar name={profile.fullName} imageUrl={profile.avatarUrl} />
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <AppText weight="bold" size="lg" className="flex-1">
                {profile.fullName || "Startuphouze member"}
              </AppText>
              {profile.openToConnect ? <View className="h-2 w-2 rounded-md bg-success" /> : null}
            </View>
            <AppText tone="primary" size="sm" weight="medium">
              {profile.headline.trim() || formatRole(profile.role)}
            </AppText>
            <ConnectionCountLabel userId={profile.id} className="mt-1" />
            <View className="mt-4 gap-1">
              {company ? (
                <AppText tone="muted" size="sm">
                  Company: {company}
                </AppText>
              ) : null}
              {location ? (
                <AppText tone="muted" size="sm">
                  Location: {location}
                </AppText>
              ) : null}
            </View>
            {skill ? (
              <View className="mt-4 self-start rounded-md bg-primary/10 px-3 py-2">
                <AppText tone="primary" size="sm">
                  {skill}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
      {showFollowButton ? <ConnectButton profile={profile} compact /> : null}
    </View>
  );
});

UserCard.displayName = "UserCard";
