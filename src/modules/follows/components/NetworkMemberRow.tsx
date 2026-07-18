import { memo } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { FollowButton } from "@/modules/follows/components/FollowButton";
import { FollowProfile } from "@/modules/follows/types";
import { UserAvatar } from "@/modules/user/components/UserAvatar";

type NetworkMemberRowProps = {
  profile: FollowProfile;
  onPress: (userId: string) => void;
  subtitle?: string;
  showFollowButton?: boolean;
};

export const NetworkMemberRow = memo(
  ({ profile, onPress, subtitle, showFollowButton = true }: NetworkMemberRowProps) => {
    const headline = profile.headline.trim() || profile.role || "Startuphouze member";
    const skill = profile.skills[0];

    return (
      <View className="rounded-md border border-border bg-surface px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Pressable accessibilityRole="button" onPress={() => onPress(profile.id)} className="flex-1">
            <View className="flex-row items-center gap-3">
              <UserAvatar name={profile.fullName} imageUrl={profile.avatarUrl} size={44} />
              <View className="flex-1">
                <AppText weight="bold" size="base" numberOfLines={1}>
                  {profile.fullName || "Startuphouze member"}
                </AppText>
                <AppText tone="primary" size="sm" weight="medium" numberOfLines={1} className="mt-0.5">
                  {headline}
                </AppText>
                {skill ? (
                  <View className="mt-2 self-start rounded-full bg-primary/10 px-2.5 py-1">
                    <AppText tone="primary" size="xs">
                      {skill}
                    </AppText>
                  </View>
                ) : null}
                {subtitle ? (
                  <AppText tone="muted" size="xs" className="mt-1.5" numberOfLines={2}>
                    {subtitle}
                  </AppText>
                ) : null}
              </View>
            </View>
          </Pressable>
          {showFollowButton ? <FollowButton profile={profile} inline /> : null}
        </View>
      </View>
    );
  }
);

NetworkMemberRow.displayName = "NetworkMemberRow";
