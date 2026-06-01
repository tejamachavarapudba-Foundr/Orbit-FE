import { create } from "zustand";

import { followsApi } from "@/modules/follows/api";
import { FollowProfile } from "@/modules/follows/types";
import { toAppError } from "@/utils/errors";

type FollowState = {
  followers: FollowProfile[];
  following: FollowProfile[];
  statusByUserId: Record<string, boolean>;
  mutatingByUserId: Record<string, boolean>;
  isLoadingNetwork: boolean;
  isRefreshingNetwork: boolean;
  networkErrorMessage: string | null;
  loadNetwork: (userId: string) => Promise<void>;
  refreshNetwork: (userId: string) => Promise<void>;
  checkStatus: (userId: string) => Promise<void>;
  followUser: (user: FollowProfile) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
};

const setMutating = (state: FollowState, userId: string, isMutating: boolean) => ({
  mutatingByUserId: {
    ...state.mutatingByUserId,
    [userId]: isMutating
  }
});

export const useFollowStore = create<FollowState>((set, get) => ({
  followers: [],
  following: [],
  statusByUserId: {},
  mutatingByUserId: {},
  isLoadingNetwork: false,
  isRefreshingNetwork: false,
  networkErrorMessage: null,
  loadNetwork: async (userId) => {
    set({ isLoadingNetwork: true, networkErrorMessage: null });

    try {
      const [followers, following] = await Promise.all([followsApi.getFollowers(userId), followsApi.getFollowing(userId)]);
      set((state) => ({
        followers,
        following,
        isLoadingNetwork: false,
        statusByUserId: {
          ...state.statusByUserId,
          ...Object.fromEntries(following.map((profile) => [profile.id, true]))
        }
      }));
    } catch (error) {
      const appError = toAppError(error);
      set({ networkErrorMessage: appError.message, isLoadingNetwork: false });
    }
  },
  refreshNetwork: async (userId) => {
    set({ isRefreshingNetwork: true, networkErrorMessage: null });

    try {
      const [followers, following] = await Promise.all([followsApi.getFollowers(userId), followsApi.getFollowing(userId)]);
      set((state) => ({
        followers,
        following,
        isRefreshingNetwork: false,
        statusByUserId: {
          ...state.statusByUserId,
          ...Object.fromEntries(following.map((profile) => [profile.id, true]))
        }
      }));
    } catch (error) {
      const appError = toAppError(error);
      set({ networkErrorMessage: appError.message, isRefreshingNetwork: false });
    }
  },
  checkStatus: async (userId) => {
    if (get().statusByUserId[userId] !== undefined || get().mutatingByUserId[userId]) {
      return;
    }

    try {
      const status = await followsApi.getStatus(userId);
      set((state) => ({
        statusByUserId: {
          ...state.statusByUserId,
          [userId]: status.isFollowing
        }
      }));
    } catch {
      set((state) => ({
        statusByUserId: {
          ...state.statusByUserId,
          [userId]: false
        }
      }));
    }
  },
  followUser: async (user) => {
    set((state) => setMutating(state, user.id, true));

    try {
      await followsApi.followUser(user.id);
      set((state) => ({
        following: state.following.some((profile) => profile.id === user.id) ? state.following : [user, ...state.following],
        statusByUserId: {
          ...state.statusByUserId,
          [user.id]: true
        },
        mutatingByUserId: {
          ...state.mutatingByUserId,
          [user.id]: false
        }
      }));
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set((state) => ({
        networkErrorMessage: appError.message,
        mutatingByUserId: {
          ...state.mutatingByUserId,
          [user.id]: false
        }
      }));
      return false;
    }
  },
  unfollowUser: async (userId) => {
    set((state) => setMutating(state, userId, true));

    try {
      await followsApi.unfollowUser(userId);
      set((state) => ({
        following: state.following.filter((profile) => profile.id !== userId),
        statusByUserId: {
          ...state.statusByUserId,
          [userId]: false
        },
        mutatingByUserId: {
          ...state.mutatingByUserId,
          [userId]: false
        }
      }));
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set((state) => ({
        networkErrorMessage: appError.message,
        mutatingByUserId: {
          ...state.mutatingByUserId,
          [userId]: false
        }
      }));
      return false;
    }
  }
}));
