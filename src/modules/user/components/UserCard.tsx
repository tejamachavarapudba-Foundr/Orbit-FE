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
    <View className="relative rounded-md border border-border bg-surface p-4 shadow-sm">
      <Pressable accessibilityRole="button" onPress={() => onPress(user.id)}>
        <View className="flex-row gap-3 pr-14">
          <UserAvatar name={profile.fullName} imageUrl={profile.avatarUrl} />
          <View className="flex-1">
            <AppText weight="bold" size="lg">
              {profile.fullName || "Orbit member"}
            </AppText>
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
      {profile.openToConnect || showFollowButton ? (
        // Rendered after the profile Pressable so it paints on top and
        // actually receives the tap — the Pressable's empty pr-14 padding
        // otherwise overlaps this same corner and swallows it first.
        <View className="absolute right-4 top-4 items-end gap-2">
          {profile.openToConnect ? <View className="h-2.5 w-2.5 rounded-full bg-success" /> : null}
          {showFollowButton ? <ConnectButton profile={profile} compact /> : null}
        </View>
      ) : null}
    </View>
  );
});

UserCard.displayName = "UserCard";
