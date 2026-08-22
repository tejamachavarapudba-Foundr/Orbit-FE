import { create } from "zustand";

import { communityApi } from "@/modules/community/api";
import { Community, CommunityDetail, CreateCommunityPayload } from "@/modules/community/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type CommunityState = {
  communities: Community[];
  selectedCommunity: CommunityDetail | null;
  isLoading: boolean;
  isCreating: boolean;
  mutatingId: string | null;
  errorMessage: string | null;
  loadCommunities: () => Promise<void>;
  selectCommunity: (id: string) => Promise<void>;
  clearSelectedCommunity: () => void;
  createCommunity: (payload: CreateCommunityPayload) => Promise<Community | null>;
  addMembers: (id: string, userIds: string[]) => Promise<boolean>;
};

export const useCommunityStore = create<CommunityState>((set) => ({
  communities: [],
  selectedCommunity: null,
  isLoading: false,
  isCreating: false,
  mutatingId: null,
  errorMessage: null,
  loadCommunities: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const communities = await communityApi.getMine();
      set({ communities, isLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  selectCommunity: async (id) => {
    set({ mutatingId: id, errorMessage: null });

    try {
      const community = await communityApi.getById(id);
      set({ selectedCommunity: community, mutatingId: null });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingId: null });
    }
  },
  clearSelectedCommunity: () => set({ selectedCommunity: null }),
  createCommunity: async (payload) => {
    set({ isCreating: true, errorMessage: null });

    try {
      const community = await communityApi.create(payload);
      set((state) => ({ communities: [community, ...state.communities], isCreating: false }));
      useToastStore.getState().show({ type: "success", title: "Community created" });
      return community;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isCreating: false });
      useToastStore.getState().show({ type: "error", title: "Couldn't create community", message: appError.message });
      return null;
    }
  },
  addMembers: async (id, userIds) => {
    set({ mutatingId: id, errorMessage: null });

    try {
      const community = await communityApi.addMembers(id, userIds);
      set({ selectedCommunity: community, mutatingId: null });
      useToastStore.getState().show({ type: "success", title: "Members added" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingId: null });
      useToastStore.getState().show({ type: "error", title: "Couldn't add members", message: appError.message });
      return false;
    }
  }
}));
