import { useCallback, useEffect, useMemo, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";

import { useAuthStore } from "@/modules/auth/store";
import { Chat } from "@/modules/chat/types";
import { useChatStore } from "@/modules/chat/store";
import { useConnectedProfiles, useIncomingConnectionRequests } from "@/modules/connections/hooks";
import { useFollowStore } from "@/modules/follows/store";
import { useUserStore } from "@/modules/user/store";

export const getOtherParticipantId = (chat: Chat, currentUserId?: string) =>
  chat.userAId === currentUserId ? chat.userBId : chat.userAId;

// Coarser than the open-thread poll (useConversationMessages) — this only
// needs to keep last-message previews/unread badges fresh, not every
// keystroke of an active conversation.
const CHATS_POLL_INTERVAL_MS = 6000;

export const useChats = () => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const chats = useChatStore((state) => state.chats) || []; // Guard fallback
  const archivedChats = useChatStore((state) => state.archivedChats) || []; // Guard fallback
  const selectedChat = useChatStore((state) => state.selectedChat);
  const isLoading = useChatStore((state) => state.isLoading);
  const isRefreshing = useChatStore((state) => state.isRefreshing);
  const isDetailLoading = useChatStore((state) => state.isDetailLoading);
  const isLoadingArchived = useChatStore((state) => state.isLoadingArchived);
  const archivingChatId = useChatStore((state) => state.archivingChatId);
  const deletingChatId = useChatStore((state) => state.deletingChatId);
  const errorMessage = useChatStore((state) => state.errorMessage);
  const detailErrorMessage = useChatStore((state) => state.detailErrorMessage);
  const loadChats = useChatStore((state) => state.loadChats);
  const refreshChats = useChatStore((state) => state.refreshChats);
  const pollChats = useChatStore((state) => state.pollChats);
  const loadArchivedChats = useChatStore((state) => state.loadArchivedChats);
  const setArchived = useChatStore((state) => state.setArchived);
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

  const connectedProfiles = useConnectedProfiles(currentUserId);
  useIncomingConnectionRequests({ enabled: Boolean(currentUserId) });

  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused || !currentUserId) {
      return;
    }

    const interval = setInterval(() => {
      void pollChats();
    }, CHATS_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [currentUserId, isFocused, pollChats]);

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

  // Loaded once so the "Archived" row can show a count without the user
  // having to open the archived list first.
  const hasRequestedArchivedRef = useRef(false);
  useEffect(() => {
    if (hasRequestedArchivedRef.current || !currentUserId) {
      return;
    }
    hasRequestedArchivedRef.current = true;
    void loadArchivedChats();
  }, [currentUserId, loadArchivedChats]);

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
    archivedChats,
    selectedChat,
    isLoading,
    isRefreshing,
    isDetailLoading,
    isLoadingArchived,
    archivingChatId,
    deletingChatId,
    errorMessage,
    detailErrorMessage,
    loadChats,
    refreshChats,
    loadArchivedChats,
    setArchived,
    selectChat,
    clearSelectedChat,
    deleteChat,
    getParticipant
  };
};
