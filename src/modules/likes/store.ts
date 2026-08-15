import { create } from "zustand";

import { useAuthStore } from "@/modules/auth/store";
import { likesApi } from "@/modules/likes/api";
import { Like } from "@/modules/likes/types";
import { toAppError } from "@/utils/errors";

type LikeState = {
  likesByPostId: Record<string, Like[]>;
  mutatingPostId: string | null;
  errorMessage: string | null;
  toggleLike: (postId: string, currentLikes: Like[]) => Promise<boolean>;
};

const isLike = (value: unknown): value is Like =>
  typeof value === "object" && value !== null && "id" in value && "postId" in value && "userId" in value;

export const useLikeStore = create<LikeState>((set, get) => ({
  likesByPostId: {},
  mutatingPostId: null,
  errorMessage: null,
  toggleLike: async (postId, currentLikes) => {
    const currentUser = useAuthStore.getState().user;
    const currentUserId = currentUser?.profile.id;
    const baseline = get().likesByPostId[postId] ?? currentLikes;
    const alreadyLiked = currentUserId != null && baseline.some((like) => like.userId === currentUserId);

    // Optimistic update so the like button reflects instantly.
    const optimisticLikes = alreadyLiked
      ? baseline.filter((like) => like.userId !== currentUserId)
      : [
          ...baseline,
          {
            id: `optimistic-${postId}-${currentUserId ?? "me"}`,
            postId,
            userId: currentUserId ?? "",
            createdAt: new Date().toISOString(),
            ...(currentUser?.profile ? { user: currentUser.profile } : {})
          }
        ];

    set((state) => ({
      likesByPostId: { ...state.likesByPostId, [postId]: optimisticLikes },
      mutatingPostId: postId,
      errorMessage: null
    }));

    try {
      const response = await likesApi.toggleLike(postId);

      set((state) => {
        const withoutCurrentUserLike = baseline.filter((like) => like.userId !== currentUserId);

        const resolvedLikes = isLike(response)
          ? [...withoutCurrentUserLike, { ...response, ...(currentUser?.profile ? { user: currentUser.profile } : {}) }]
          : response.liked
            ? [
                ...withoutCurrentUserLike,
                {
                  id: `${postId}-${currentUserId ?? "me"}`,
                  postId,
                  userId: currentUserId ?? "",
                  createdAt: new Date().toISOString(),
                  ...(currentUser?.profile ? { user: currentUser.profile } : {})
                }
              ]
            : withoutCurrentUserLike;

        return {
          likesByPostId: { ...state.likesByPostId, [postId]: resolvedLikes },
          mutatingPostId: null
        };
      });

      return true;
    } catch (error) {
      const appError = toAppError(error);
      // Roll back the optimistic update on failure.
      set((state) => ({
        likesByPostId: { ...state.likesByPostId, [postId]: baseline },
        errorMessage: appError.message,
        mutatingPostId: null
      }));
      return false;
    }
  }
}));
