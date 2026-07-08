import { useMemo } from "react";

import { useAuthStore } from "@/modules/auth/store";
import { useLikeStore } from "@/modules/likes/store";
import { Like } from "@/modules/likes/types";

export const usePostLikes = (
  postId: string,
  initialLikes: Like[],
) => {
  const currentUserId = useAuthStore(
    (state) => state.user?.profile.id,
  );

  const mutatingPostId = useLikeStore(
    (state) => state.mutatingPostId,
  );

  const toggleLike = useLikeStore(
    (state) => state.toggleLike,
  );

  const postLikes = useMemo(
    () => initialLikes,
    [initialLikes],
  );

  const isLikedByMe =
    currentUserId != null
      ? postLikes.some(
          (like) => like.userId === currentUserId,
        )
      : false;

  return {
    likesCount: postLikes.length,
    isLikedByMe,
    isMutating: mutatingPostId === postId,
    toggleLike: () => toggleLike(postId),
  };
};