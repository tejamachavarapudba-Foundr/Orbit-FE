import { create } from "zustand";

type SavedPostsState = {
  savedPostIds: Set<string>;
  toggleSaved: (postId: string) => void;
};

// Session-only bookmark state. There is no backend model for saved posts yet,
// so this does not persist across app restarts or sync across devices.
export const useSavedPostsStore = create<SavedPostsState>((set) => ({
  savedPostIds: new Set(),
  toggleSaved: (postId) =>
    set((state) => {
      const next = new Set(state.savedPostIds);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return { savedPostIds: next };
    }),
}));
