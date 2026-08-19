import { create } from "zustand";

type FeedVisibilityState = {
  activePostId: string | null;
  setActivePostId: (id: string | null) => void;
};

// Tracks which single post is currently most visible in the feed, so a
// post's video can autoplay when scrolled into view and pause when it
// scrolls away — without re-rendering every card in the list.
export const useFeedVisibilityStore = create<FeedVisibilityState>((set) => ({
  activePostId: null,
  setActivePostId: (id) => set({ activePostId: id })
}));
