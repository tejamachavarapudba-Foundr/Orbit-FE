import { create } from "zustand";

import { Comment } from "@/modules/comments/types";

type CommentsSheetState = {
  postId: string | null;
  initialComments: Comment[];
  open: (postId: string, initialComments: Comment[]) => void;
  close: () => void;
};

// Single overlay rendered once at the screen level (see FeedScreen.tsx /
// SavedPostsScreen.tsx) instead of RN's <Modal> per post. <Modal> opens a
// separate Android Dialog window that doesn't inherit the Activity's
// windowSoftInputMode="adjustResize" (set in AndroidManifest.xml) — that
// mismatch is what caused Send to eat its first tap after the keyboard
// closed. A plain in-tree overlay stays part of the Activity's own window,
// so it gets adjustResize behavior for free.
export const useCommentsSheetStore = create<CommentsSheetState>((set) => ({
  postId: null,
  initialComments: [],
  open: (postId, initialComments) => set({ postId, initialComments }),
  close: () => set({ postId: null, initialComments: [] })
}));
