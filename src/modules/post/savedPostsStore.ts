import { create } from "zustand";

import { postApi } from "@/modules/post/api";
import { Post } from "@/modules/post/types";

type SavedPostsState = {
  savedPosts: Post[];
  savedPostIds: Set<string>;
  isLoading: boolean;
  loadSavedPosts: () => Promise<void>;
  toggleSaved: (postId: string) => Promise<void>;
};

export const useSavedPostsStore = create<SavedPostsState>((set, get) => ({
  savedPosts: [],
  savedPostIds: new Set(),
  isLoading: false,

  loadSavedPosts: async () => {
    set({ isLoading: true });

    try {
      const savedPosts = await postApi.getSavedPosts();
      set({
        savedPosts,
        savedPostIds: new Set(savedPosts.map((post) => post.id)),
        isLoading: false
      });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleSaved: async (postId) => {
    const wasSaved = get().savedPostIds.has(postId);

    set((state) => {
      const nextIds = new Set(state.savedPostIds);
      if (wasSaved) {
        nextIds.delete(postId);
      } else {
        nextIds.add(postId);
      }
      return {
        savedPostIds: nextIds,
        savedPosts: wasSaved ? state.savedPosts.filter((post) => post.id !== postId) : state.savedPosts
      };
    });

    try {
      await postApi.toggleSavePost(postId);
      if (!wasSaved) {
        void get().loadSavedPosts();
      }
    } catch {
      set((state) => {
        const revertedIds = new Set(state.savedPostIds);
        if (wasSaved) {
          revertedIds.add(postId);
        } else {
          revertedIds.delete(postId);
        }
        return { savedPostIds: revertedIds };
      });
    }
  }
}));
