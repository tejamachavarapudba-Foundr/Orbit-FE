import { memo } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { useFollowAction } from "@/modules/follows/hooks";
import { FollowProfile } from "@/modules/follows/types";

type FollowButtonProps = {
  profile: FollowProfile;
  compact?: boolean;
};

export const FollowButton = memo(({ profile, compact = false }: FollowButtonProps) => {
  const { isSelf, isFollowing, isStatusLoading, isMutating, toggleFollow } = useFollowAction(profile);

  if (isSelf) {
    return null;
  }

  return (
    <AppButton
      label={isFollowing ? "Following" : "Follow"}
      variant={isFollowing ? "outline" : "primary"}
      loading={isStatusLoading || isMutating}
      onPress={() => void toggleFollow()}
      className={compact ? "mt-4 h-10 self-start px-5" : "mt-4"}
    />
  );
});

FollowButton.displayName = "FollowButton";
