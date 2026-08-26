import { Feather } from "@expo/vector-icons";
import { create } from "zustand";

export type PostMenuAction = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  destructive?: boolean;
};

type PostActionsSheetState = {
  isOpen: boolean;
  actions: PostMenuAction[];
  open: (actions: PostMenuAction[]) => void;
  close: () => void;
};

// Single global sheet instance (rendered once near the app root) that any
// PostCard can trigger — a BottomSheetModal per list row is what caused the
// old Modal-based menu to misbehave inside a scrolling FlatList on Android.
export const usePostActionsSheetStore = create<PostActionsSheetState>((set) => ({
  isOpen: false,
  actions: [],
  open: (actions) => set({ isOpen: true, actions }),
  close: () => set({ isOpen: false })
}));
