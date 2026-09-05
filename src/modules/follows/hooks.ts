import { useCallback, useEffect, useMemo, useRef } from "react";

import { FollowProfile, NetworkTab } from "@/modules/follows/types";
import { useFollowStore } from "@/modules/follows/store";
import { buildNetworkSuggestions } from "@/modules/follows/suggestionEngine";
import { useAuthStore } from "@/modules/auth/store";
import { useConnectedProfiles } from "@/modules/connections/hooks";
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
  const requestedForUserRef = useRef<string | null>(null);

  // Fires once per signed-in user — gating on "followers/following length ===
  // 0" instead would never converge for an account with genuinely no
  // connections yet, since every load resolves back to length 0 and
  // re-triggers the request forever.
  useEffect(() => {
    if (!currentUserId || requestedForUserRef.current === currentUserId || isLoadingNetwork) {
      return;
    }
    requestedForUserRef.current = currentUserId;
    void loadNetwork(currentUserId);
  }, [currentUserId, isLoadingNetwork, loadNetwork]);

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
  const connectedProfiles = useConnectedProfiles(viewer?.id);
  const users = useUserStore((state) => state.users);
  const isLoadingUsers = useUserStore((state) => state.isLoading);
  const loadUsers = useUserStore((state) => state.loadUsers);
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (hasRequestedRef.current || isLoadingUsers) {
      return;
    }
    hasRequestedRef.current = true;
    void loadUsers();
  }, [isLoadingUsers, loadUsers]);

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
