import { useCallback, useEffect, useMemo } from "react";

import { useAuthStore } from "@/modules/auth/store";
import { Chat } from "@/modules/chat/types";
import { useChatStore } from "@/modules/chat/store";
import { useFollowStore } from "@/modules/follows/store";
import { useUserStore } from "@/modules/user/store";
import { UserSummary } from "@/modules/user/types";

export const getOtherParticipantId = (chat: Chat, currentUserId?: string) =>
  chat.userAId === currentUserId ? chat.userBId : chat.userAId;

export const useChats = () => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const chats = useChatStore((state) => state.chats);
  const selectedChat = useChatStore((state) => state.selectedChat);
  const isLoading = useChatStore((state) => state.isLoading);
  const isRefreshing = useChatStore((state) => state.isRefreshing);
  const isCreating = useChatStore((state) => state.isCreating);
  const isDetailLoading = useChatStore((state) => state.isDetailLoading);
  const deletingChatId = useChatStore((state) => state.deletingChatId);
  const errorMessage = useChatStore((state) => state.errorMessage);
  const detailErrorMessage = useChatStore((state) => state.detailErrorMessage);
  const loadChats = useChatStore((state) => state.loadChats);
  const refreshChats = useChatStore((state) => state.refreshChats);
  const createChat = useChatStore((state) => state.createChat);
  const selectChat = useChatStore((state) => state.selectChat);
  const clearSelectedChat = useChatStore((state) => state.clearSelectedChat);
  const deleteChat = useChatStore((state) => state.deleteChat);
  const users = useUserStore((state) => state.users);
  const isUsersLoading = useUserStore((state) => state.isLoading);
  const loadUsers = useUserStore((state) => state.loadUsers);
  const followers = useFollowStore((state) => state.followers);
  const following = useFollowStore((state) => state.following);
  const isLoadingNetwork = useFollowStore((state) => state.isLoadingNetwork);
  const loadNetwork = useFollowStore((state) => state.loadNetwork);

  useEffect(() => {
    if (chats.length === 0 && !isLoading) {
      void loadChats();
    }
  }, [chats.length, isLoading, loadChats]);

  useEffect(() => {
    if (users.length === 0 && !isUsersLoading) {
      void loadUsers();
    }
  }, [isUsersLoading, loadUsers, users.length]);

  useEffect(() => {
    if (currentUserId && followers.length === 0 && following.length === 0 && !isLoadingNetwork) {
      void loadNetwork(currentUserId);
    }
  }, [currentUserId, followers.length, following.length, isLoadingNetwork, loadNetwork]);

  const profilesById = useMemo(() => {
    const map = Object.fromEntries(users.map((user) => [user.profile.id, user.profile]));

    for (const profile of [...followers, ...following]) {
      map[profile.id] = profile;
    }

    return map;
  }, [followers, following, users]);

  const chatParticipantIds = useMemo(
    () => new Set(chats.map((chat) => getOtherParticipantId(chat, currentUserId))),
    [chats, currentUserId]
  );

  const networkUserIds = useMemo(() => {
    const ids = new Set<string>();
    followers.forEach((profile) => ids.add(profile.id));
    following.forEach((profile) => ids.add(profile.id));
    return ids;
  }, [followers, following]);

  const startableUsers = useMemo(() => {
    const seen = new Set<string>();
    const result: UserSummary[] = [];

    for (const profile of [...following, ...followers]) {
      if (!profile.id || profile.id === currentUserId || chatParticipantIds.has(profile.id) || seen.has(profile.id)) {
        continue;
      }

      if (!networkUserIds.has(profile.id)) {
        continue;
      }

      seen.add(profile.id);
      result.push({
        id: profile.id,
        profile,
        createdAt: ""
      });
    }

    return result.slice(0, 8);
  }, [chatParticipantIds, currentUserId, followers, following, networkUserIds]);

  const getParticipant = useCallback(
    (chat: Chat) => profilesById[getOtherParticipantId(chat, currentUserId)],
    [currentUserId, profilesById]
  );

  const startChat = useCallback(
    (user: UserSummary) => {
      if (!networkUserIds.has(user.profile.id)) {
        return Promise.resolve(false);
      }

      return createChat(user.profile.id);
    },
    [createChat, networkUserIds]
  );

  return {
    currentUserId,
    chats,
    selectedChat,
    startableUsers,
    isLoading,
    isRefreshing,
    isCreating,
    isDetailLoading,
    deletingChatId,
    errorMessage,
    detailErrorMessage,
    loadChats,
    refreshChats,
    startChat,
    selectChat,
    clearSelectedChat,
    deleteChat,
    getParticipant
  };
};
