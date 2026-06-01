import { useCallback, useEffect } from "react";

import { FollowProfile, NetworkTab } from "@/modules/follows/types";
import { useFollowStore } from "@/modules/follows/store";
import { useAuthStore } from "@/modules/auth/store";
import { useToastStore } from "@/store/toastStore";

export const useNetwork = (activeTab: NetworkTab) => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const followers = useFollowStore((state) => state.followers);
  const following = useFollowStore((state) => state.following);
  const isLoadingNetwork = useFollowStore((state) => state.isLoadingNetwork);
  const isRefreshingNetwork = useFollowStore((state) => state.isRefreshingNetwork);
  const networkErrorMessage = useFollowStore((state) => state.networkErrorMessage);
  const loadNetwork = useFollowStore((state) => state.loadNetwork);
  const refreshNetwork = useFollowStore((state) => state.refreshNetwork);

  useEffect(() => {
    if (currentUserId && followers.length === 0 && following.length === 0 && !isLoadingNetwork) {
      void loadNetwork(currentUserId);
    }
  }, [currentUserId, followers.length, following.length, isLoadingNetwork, loadNetwork]);

  const refresh = useCallback(() => {
    if (!currentUserId) {
      return Promise.resolve();
    }

    return refreshNetwork(currentUserId);
  }, [currentUserId, refreshNetwork]);

  return {
    currentUserId,
    profiles: activeTab === "followers" ? followers : following,
    followersCount: followers.length,
    followingCount: following.length,
    isLoadingNetwork,
    isRefreshingNetwork,
    networkErrorMessage,
    loadNetwork,
    refresh
  };
};

export const useFollowAction = (profile: FollowProfile) => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const isFollowing = useFollowStore((state) => state.statusByUserId[profile.id]);
  const isMutating = useFollowStore((state) => state.mutatingByUserId[profile.id] ?? false);
  const checkStatus = useFollowStore((state) => state.checkStatus);
  const followUser = useFollowStore((state) => state.followUser);
  const unfollowUser = useFollowStore((state) => state.unfollowUser);
  const showToast = useToastStore((state) => state.show);
  const isSelf = currentUserId === profile.id;

  useEffect(() => {
    if (!isSelf) {
      void checkStatus(profile.id);
    }
  }, [checkStatus, isSelf, profile.id]);

  const toggleFollow = useCallback(async () => {
    const didSucceed = isFollowing ? await unfollowUser(profile.id) : await followUser(profile);

    if (didSucceed) {
      showToast({
        type: "success",
        title: isFollowing ? "Unfollowed" : "Following",
        message: isFollowing ? `${profile.fullName} was removed from your network.` : `${profile.fullName} is now in your network.`
      });
    }
  }, [followUser, isFollowing, profile, showToast, unfollowUser]);

  return {
    isSelf,
    isFollowing: isFollowing ?? false,
    isStatusLoading: isFollowing === undefined && !isSelf,
    isMutating,
    toggleFollow
  };
};
