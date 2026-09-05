import { create } from "zustand";

import { chatApi } from "@/modules/chat/api";
import { Chat } from "@/modules/chat/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type ChatState = {
  chats: Chat[];
  archivedChats: Chat[];
  selectedChat: Chat | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  isDetailLoading: boolean;
  isLoadingArchived: boolean;
  archivingChatId: string | null;
  deletingChatId: string | null;
  errorMessage: string | null;
  detailErrorMessage: string | null;
  loadChats: () => Promise<void>;
  refreshChats: () => Promise<void>;
  pollChats: () => Promise<void>;
  loadArchivedChats: () => Promise<void>;
  setArchived: (id: string, archived: boolean) => Promise<boolean>;
  createChat: (participantId: string) => Promise<boolean>;
  selectChat: (id: string) => Promise<void>;
  clearSelectedChat: () => void;
  deleteChat: (id: string) => Promise<boolean>;
  patchLastMessage: (chatId: string, message: { id?: string; senderId?: string; content?: string; createdAt?: string }) => void;
  markLastMessageRead: (chatId: string, messageId: string) => void;
};

const sortChats = (chats: Chat[]) =>
  [...chats].sort((first, second) => new Date(second.lastMessageAt).getTime() - new Date(first.lastMessageAt).getTime());

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  archivedChats: [],
  selectedChat: null,
  isLoading: false,
  isRefreshing: false,
  isCreating: false,
  isDetailLoading: false,
  isLoadingArchived: false,
  archivingChatId: null,
  deletingChatId: null,
  errorMessage: null,
  detailErrorMessage: null,
  loadChats: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const chats = await chatApi.getChats(false);
      set({ chats: sortChats(chats), isLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  refreshChats: async () => {
    set({ isRefreshing: true, errorMessage: null });

    try {
      const chats = await chatApi.getChats(false);
      set({ chats: sortChats(chats), isRefreshing: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isRefreshing: false });
    }
  },
  // Background tick for the chat list — same fetch as refreshChats but
  // never touches isRefreshing, so it can't flash the pull-to-refresh spinner.
  pollChats: async () => {
    try {
      const chats = await chatApi.getChats(false);
      set({ chats: sortChats(chats) });
    } catch {
      // Silent — next tick retries.
    }
  },
  loadArchivedChats: async () => {
    set({ isLoadingArchived: true, errorMessage: null });

    try {
      const archivedChats = await chatApi.getChats(true);
      set({ archivedChats: sortChats(archivedChats), isLoadingArchived: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoadingArchived: false });
    }
  },
  setArchived: async (id, archived) => {
    set({ archivingChatId: id, errorMessage: null });

    try {
      const updated = await chatApi.setArchived(id, archived);
      set((state) => ({
        // Move the chat between the two lists rather than refetching both.
        chats: archived ? state.chats.filter((chat) => chat.id !== id) : sortChats([...state.chats.filter((chat) => chat.id !== id), updated]),
        archivedChats: archived
          ? sortChats([...state.archivedChats.filter((chat) => chat.id !== id), updated])
          : state.archivedChats.filter((chat) => chat.id !== id),
        selectedChat: state.selectedChat?.id === id ? updated : state.selectedChat,
        archivingChatId: null
      }));
      useToastStore.getState().show({ type: "success", title: archived ? "Chat archived" : "Chat unarchived" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, archivingChatId: null });
      useToastStore.getState().show({ type: "error", title: "Couldn't update chat", message: appError.message });
      return false;
    }
  },
  createChat: async (participantId) => {
    set({ isCreating: true, errorMessage: null });

    try {
      const chat = await chatApi.createChat({ participantId });
      set((state) => ({
        chats: sortChats(state.chats.some((item) => item.id === chat.id) ? state.chats : [chat, ...state.chats]),
        selectedChat: chat,
        isCreating: false
      }));
      useToastStore.getState().show({ type: "success", title: "Chat ready" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isCreating: false });
      useToastStore.getState().show({ type: "error", title: "Chat failed", message: appError.message });
      return false;
    }
  },
  selectChat: async (id) => {
    set({ isDetailLoading: true, detailErrorMessage: null });

    try {
      const chat = await chatApi.getChatById(id);
      set({ selectedChat: chat, isDetailLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ detailErrorMessage: appError.message, isDetailLoading: false });
    }
  },
  clearSelectedChat: () => set({ selectedChat: null, detailErrorMessage: null }),
  deleteChat: async (id) => {
    set({ deletingChatId: id, errorMessage: null });

    try {
      await chatApi.deleteChat(id);
      set((state) => ({
        chats: state.chats.filter((chat) => chat.id !== id),
        archivedChats: state.archivedChats.filter((chat) => chat.id !== id),
        selectedChat: state.selectedChat?.id === id ? null : state.selectedChat,
        deletingChatId: null
      }));
      useToastStore.getState().show({ type: "success", title: "Chat deleted" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, deletingChatId: null });
      useToastStore.getState().show({ type: "error", title: "Delete failed", message: appError.message });
      return false;
    }
  },
  patchLastMessage: (chatId, message) => {
    set((state) => {
      const applyPatch = (chat: Chat): Chat => {
        if (chat.id !== chatId) {
          return chat;
        }
        const existingMessages = chat.messages ?? [];
        const nextMessages = message.id && existingMessages.some((item) => item.id === message.id)
          ? existingMessages
          : [...existingMessages, message];

        return {
          ...chat,
          lastMessageAt: message.createdAt ?? new Date().toISOString(),
          messages: nextMessages
        };
      };

      return {
        chats: sortChats(state.chats.map(applyPatch)),
        archivedChats: sortChats(state.archivedChats.map(applyPatch)),
        selectedChat: state.selectedChat ? applyPatch(state.selectedChat) : state.selectedChat
      };
    });
  },
  markLastMessageRead: (chatId, messageId) => {
    set((state) => {
      const applyPatch = (chat: Chat): Chat => {
        if (chat.id !== chatId) {
          return chat;
        }
        return {
          ...chat,
          messages: (chat.messages ?? []).map((item) =>
            item.id === messageId ? { ...item, readAt: new Date().toISOString() } : item
          )
        };
      };

      return {
        chats: state.chats.map(applyPatch),
        archivedChats: state.archivedChats.map(applyPatch),
        selectedChat: state.selectedChat ? applyPatch(state.selectedChat) : state.selectedChat
      };
    });
  }
}));
