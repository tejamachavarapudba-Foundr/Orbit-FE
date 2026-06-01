import { useEffect, useMemo } from "react";

import { useAuthStore } from "@/modules/auth/store";
import { useLikeStore } from "@/modules/likes/store";

export const usePostLikes = (postId: string) => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const likes = useLikeStore((state) => state.likes);
  const isLoading = useLikeStore((state) => state.isLoading);
  const mutatingPostId = useLikeStore((state) => state.mutatingPostId);
  const loadLikes = useLikeStore((state) => state.loadLikes);
  const toggleLike = useLikeStore((state) => state.toggleLike);

  useEffect(() => {
    if (likes.length === 0 && !isLoading) {
      void loadLikes();
    }
  }, [isLoading, likes.length, loadLikes]);

  const postLikes = useMemo(() => likes.filter((like) => like.postId === postId), [likes, postId]);
  const isLikedByMe = currentUserId ? postLikes.some((like) => like.userId === currentUserId) : false;

  return {
    likesCount: postLikes.length,
    isLikedByMe,
    isLoading,
    isMutating: mutatingPostId === postId,
    toggleLike: () => toggleLike(postId)
  };
};
