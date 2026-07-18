import { memo } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { useFollowAction } from "@/modules/follows/hooks";
import { FollowProfile } from "@/modules/follows/types";

type FollowButtonProps = {
  profile: FollowProfile;
  compact?: boolean;
  inline?: boolean;
  connectMode?: boolean;
};

export const FollowButton = memo(({ profile, compact = false, inline = false, connectMode = false }: FollowButtonProps) => {
  const { isSelf, isFollowing, isStatusLoading, isMutating, toggleFollow } = useFollowAction(profile);

  if (isSelf) {
    return null;
  }

  const followLabel = connectMode ? "Connect" : "Follow";
  const followingLabel = connectMode ? "Connected" : "Following";
  const rowClass = inline
    ? "h-9 shrink-0 px-3"
    : connectMode
      ? "h-11 w-full"
      : compact
        ? "mt-4 h-10 self-start px-5"
        : "mt-4";

  return (
    <AppButton
      label={isFollowing ? followingLabel : followLabel}
      variant={isFollowing ? "outline" : "primary"}
      size={inline ? "sm" : "default"}
      loading={isStatusLoading || isMutating}
      onPress={() => void toggleFollow()}
      className={rowClass}
    />
  );
});

FollowButton.displayName = "FollowButton";
