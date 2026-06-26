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
      const [rawFollowers, rawFollowing] = await Promise.all([
        followsApi.getFollowers(userId), 
        followsApi.getFollowing(userId)
      ]);
      
      // Defend against bad API payloads returning undefined/null values instead of arrays
      const followers = Array.isArray(rawFollowers) ? rawFollowers : [];
      const following = Array.isArray(rawFollowing) ? rawFollowing : [];

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
      set({ 
        networkErrorMessage: appError.message, 
        isLoadingNetwork: false,
        followers: [], // Safeguard: Reset back to empty array on failure
        following: []  // Safeguard: Reset back to empty array on failure
      });
    }
  },
  
  refreshNetwork: async (userId) => {
    set({ isRefreshingNetwork: true, networkErrorMessage: null });

    try {
      const [rawFollowers, rawFollowing] = await Promise.all([
        followsApi.getFollowers(userId), 
        followsApi.getFollowing(userId)
      ]);

      const followers = Array.isArray(rawFollowers) ? rawFollowers : [];
      const following = Array.isArray(rawFollowing) ? rawFollowing : [];

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
      set({ 
        networkErrorMessage: appError.message, 
        isRefreshingNetwork: false,
        followers: [], // Safeguard
        following: []  // Safeguard
      });
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
          [userId]: status?.isFollowing ?? false
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
    if (!user?.id) return false;
    set((state) => setMutating(state, user.id, true));

    try {
      await followsApi.followUser(user.id);
      set((state) => {
        const safeFollowing = state.following || [];
        return {
          following: safeFollowing.some((profile) => profile.id === user.id) 
            ? safeFollowing 
            : [user, ...safeFollowing],
          statusByUserId: {
            ...state.statusByUserId,
            [user.id]: true
          },
          mutatingByUserId: {
            ...state.mutatingByUserId,
            [user.id]: false
          }
        };
      });
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
    if (!userId) return false;
    set((state) => setMutating(state, userId, true));

    try {
      await followsApi.unfollowUser(userId);
      set((state) => {
        const safeFollowing = state.following || [];
        return {
          following: safeFollowing.filter((profile) => profile.id !== userId),
          statusByUserId: {
            ...state.statusByUserId,
            [userId]: false
          },
          mutatingByUserId: {
            ...state.mutatingByUserId,
            [userId]: false
          }
        };
      });
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
