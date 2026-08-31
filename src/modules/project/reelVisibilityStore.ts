import { create } from "zustand";

type ReelVisibilityState = {
  activeReelId: string | null;
  setActiveReelId: (id: string | null) => void;
};

// Tracks which single reel is currently on screen, so its video can
// autoplay while every other reel in the list stays paused — mirrors
// modules/post/feedVisibilityStore.ts, kept separate since it tracks a
// different id space (projects, not posts).
export const useReelVisibilityStore = create<ReelVisibilityState>((set) => ({
  activeReelId: null,
  setActiveReelId: (id) => set({ activeReelId: id })
}));
