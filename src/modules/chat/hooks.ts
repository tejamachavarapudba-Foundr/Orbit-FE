import { useCallback, useEffect, useMemo, useRef } from "react";

import { useAuthStore } from "@/modules/auth/store";
import { Chat } from "@/modules/chat/types";
import { useChatStore } from "@/modules/chat/store";
import { useConnectionsStore } from "@/modules/connections/store";
import { useFollowStore } from "@/modules/follows/store";
import { useUserStore } from "@/modules/user/store";

export const getOtherParticipantId = (chat: Chat, currentUserId?: string) =>
  chat.userAId === currentUserId ? chat.userBId : chat.userAId;

export const useChats = () => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const chats = useChatStore((state) => state.chats) || []; // Guard fallback
  const selectedChat = useChatStore((state) => state.selectedChat);
  const isLoading = useChatStore((state) => state.isLoading);
  const isRefreshing = useChatStore((state) => state.isRefreshing);
  const isDetailLoading = useChatStore((state) => state.isDetailLoading);
  const deletingChatId = useChatStore((state) => state.deletingChatId);
  const errorMessage = useChatStore((state) => state.errorMessage);
  const detailErrorMessage = useChatStore((state) => state.detailErrorMessage);
  const loadChats = useChatStore((state) => state.loadChats);
  const refreshChats = useChatStore((state) => state.refreshChats);
  const selectChat = useChatStore((state) => state.selectChat);
  const clearSelectedChat = useChatStore((state) => state.clearSelectedChat);
  const deleteChat = useChatStore((state) => state.deleteChat);

  const users = useUserStore((state) => state.users) || []; // Guard fallback
  const isUsersLoading = useUserStore((state) => state.isLoading);
  const loadUsers = useUserStore((state) => state.loadUsers);
  const hasRequestedUsersRef = useRef(false);

  // High-risk store array references injected with fallback primitives
  const rawFollowers = useFollowStore((state) => state.followers);
  const rawFollowing = useFollowStore((state) => state.following);
  const followers = useMemo(() => rawFollowers || [], [rawFollowers]);
  const following = useMemo(() => rawFollowing || [], [rawFollowing]);

  const loadNetwork = useFollowStore((state) => state.loadNetwork);

  const rawConnectedProfiles = useConnectionsStore((state) => state.connectedProfiles);
  const connectedProfiles = useMemo(() => rawConnectedProfiles || [], [rawConnectedProfiles]);

  const loadConnectedProfiles = useConnectionsStore((state) => state.loadConnectedProfiles);
  const loadIncomingRequests = useConnectionsStore((state) => state.loadIncomingRequests);

  // Chats are loaded once at the navigator level (MainNavigator), keyed off
  // currentUserId rather than "chats.length === 0" — the latter would never
  // converge for an account with no conversations yet.
  useEffect(() => {
    if (hasRequestedUsersRef.current || isUsersLoading) {
      return;
    }
    hasRequestedUsersRef.current = true;
    void loadUsers();
  }, [isUsersLoading, loadUsers]);

  useEffect(() => {
    if (currentUserId) {
      void loadNetwork(currentUserId);
    }
  }, [currentUserId, loadNetwork]);

  useEffect(() => {
    if (currentUserId) {
      void loadConnectedProfiles(currentUserId);
      void loadIncomingRequests();
    }
  }, [currentUserId, loadConnectedProfiles, loadIncomingRequests]);

  const profilesById = useMemo(() => {
    const map = Object.fromEntries(users.map((user) => [user.profile.id, user.profile]));

    // Safe spread operators inside a memoization matrix
    for (const profile of [...followers, ...following, ...connectedProfiles]) {
      if (profile?.id) {
        map[profile.id] = profile;
      }
    }

    return map;
  }, [connectedProfiles, followers, following, users]);

  const getParticipant = useCallback(
    (chat: Chat) => profilesById[getOtherParticipantId(chat, currentUserId)],
    [currentUserId, profilesById]
  );

  return {
    currentUserId,
    chats,
    selectedChat,
    isLoading,
    isRefreshing,
    isDetailLoading,
    deletingChatId,
    errorMessage,
    detailErrorMessage,
    loadChats,
    refreshChats,
    selectChat,
    clearSelectedChat,
    deleteChat,
    getParticipant
  };
};
