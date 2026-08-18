import { useCallback, useEffect, useMemo } from "react";

import { FollowProfile, NetworkTab } from "@/modules/follows/types";
import { useFollowStore } from "@/modules/follows/store";
import { buildNetworkSuggestions } from "@/modules/follows/suggestionEngine";
import { useAuthStore } from "@/modules/auth/store";
import { useConnectionsStore } from "@/modules/connections/store";
import { useToastStore } from "@/store/toastStore";
import { useUserStore } from "@/modules/user/store";

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
    profiles: activeTab === "followers" ? followers : activeTab === "following" ? following : [],
    followersCount: followers.length,
    followingCount: following.length,
    following,
    followers,
    isLoadingNetwork,
    isRefreshingNetwork,
    networkErrorMessage,
    loadNetwork,
    refresh
  };
};

export const useFollowCounts = (userId: string | undefined) => {
  const counts = useFollowStore((state) => (userId ? state.countsByUserId[userId] : undefined));
  const fetchCounts = useFollowStore((state) => state.fetchCounts);

  useEffect(() => {
    if (userId) {
      void fetchCounts(userId);
    }
  }, [fetchCounts, userId]);

  return counts;
};

export const useNetworkSuggestions = () => {
  const viewer = useAuthStore((state) => state.user?.profile);
  const following = useFollowStore((state) => state.following);
  const followers = useFollowStore((state) => state.followers);
  const connectedProfiles = useConnectionsStore((state) => state.connectedProfiles);
  const users = useUserStore((state) => state.users);
  const isLoadingUsers = useUserStore((state) => state.isLoading);
  const loadUsers = useUserStore((state) => state.loadUsers);

  useEffect(() => {
    if (users.length === 0 && !isLoadingUsers) {
      void loadUsers();
    }
  }, [isLoadingUsers, loadUsers, users.length]);

  const connectedIds = useMemo(
    () => new Set(connectedProfiles.map((profile) => profile.id)),
    [connectedProfiles]
  );

  const suggestions = useMemo(
    () =>
      buildNetworkSuggestions(
        viewer,
        users.map((user) => user.profile),
        following,
        followers,
        connectedIds
      ),
    [connectedIds, followers, following, users, viewer]
  );

  return {
    suggestions,
    isLoadingSuggestions: isLoadingUsers
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
