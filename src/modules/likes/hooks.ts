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

  const storeLikesForPost = useLikeStore(
    (state) => state.likesByPostId[postId],
  );

  // The store only tracks posts once they've been toggled locally; until
  // then, fall back to the snapshot the post list was loaded with.
  const postLikes = useMemo(
    () => storeLikesForPost ?? initialLikes,
    [storeLikesForPost, initialLikes],
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
    toggleLike: () => toggleLike(postId, initialLikes),
  };
};
