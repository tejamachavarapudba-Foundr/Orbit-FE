import { create } from "zustand";

import { useAuthStore } from "@/modules/auth/store";
import { likesApi } from "@/modules/likes/api";
import { Like } from "@/modules/likes/types";
import { toAppError } from "@/utils/errors";

type LikeState = {
  likes: Like[];
  isLoading: boolean;
  mutatingPostId: string | null;
  errorMessage: string | null;
  loadLikes: () => Promise<void>;
  toggleLike: (postId: string) => Promise<boolean>;
};

const isLike = (value: unknown): value is Like =>
  typeof value === "object" && value !== null && "id" in value && "postId" in value && "userId" in value;

export const useLikeStore = create<LikeState>((set, get) => ({
  likes: [],
  isLoading: false,
  mutatingPostId: null,
  errorMessage: null,
  loadLikes: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const likes = await likesApi.getLikes();
      set({ likes, isLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  toggleLike: async (postId) => {
    set({ mutatingPostId: postId, errorMessage: null });

    try {
      const response = await likesApi.toggleLike(postId);
      const currentUser = useAuthStore.getState().user;

      set((state) => {
        const currentUserId = currentUser?.profile.id;
        const withoutCurrentUserLike = state.likes.filter(
          (like) => !(like.postId === postId && like.userId === currentUserId)
        );

        if (isLike(response)) {
          return {
            likes: [
              ...withoutCurrentUserLike,
              {
                ...response,
                ...(currentUser?.profile ? { user: currentUser.profile } : {})
              }
            ],
            mutatingPostId: null
          };
        }

        return {
          likes: response.liked
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
            : withoutCurrentUserLike,
          mutatingPostId: null
        };
      });

      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingPostId: null });
      return false;
    }
  }
}));
