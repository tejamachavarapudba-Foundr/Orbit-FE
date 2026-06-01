import { useCallback, useEffect, useMemo } from "react";

import { useAuthStore } from "@/modules/auth/store";
import { Chat } from "@/modules/chat/types";
import { useChatStore } from "@/modules/chat/store";
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

  const profilesById = useMemo(
    () => Object.fromEntries(users.map((user) => [user.profile.id, user.profile])),
    [users]
  );

  const chatParticipantIds = useMemo(
    () => new Set(chats.map((chat) => getOtherParticipantId(chat, currentUserId))),
    [chats, currentUserId]
  );

  const startableUsers = useMemo(
    () => users.filter((user) => user.profile.id !== currentUserId && !chatParticipantIds.has(user.profile.id)).slice(0, 8),
    [chatParticipantIds, currentUserId, users]
  );

  const getParticipant = useCallback(
    (chat: Chat) => profilesById[getOtherParticipantId(chat, currentUserId)],
    [currentUserId, profilesById]
  );

  const startChat = useCallback(
    (user: UserSummary) => createChat(user.profile.id),
    [createChat]
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
