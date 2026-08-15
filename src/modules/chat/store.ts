import { create } from "zustand";

import { chatApi } from "@/modules/chat/api";
import { Chat } from "@/modules/chat/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type ChatState = {
  chats: Chat[];
  selectedChat: Chat | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  isDetailLoading: boolean;
  deletingChatId: string | null;
  errorMessage: string | null;
  detailErrorMessage: string | null;
  loadChats: () => Promise<void>;
  refreshChats: () => Promise<void>;
  createChat: (participantId: string) => Promise<boolean>;
  selectChat: (id: string) => Promise<void>;
  clearSelectedChat: () => void;
  deleteChat: (id: string) => Promise<boolean>;
  patchLastMessage: (chatId: string, message: { id?: string; senderId?: string; content?: string; createdAt?: string }) => void;
};

const sortChats = (chats: Chat[]) =>
  [...chats].sort((first, second) => new Date(second.lastMessageAt).getTime() - new Date(first.lastMessageAt).getTime());

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  selectedChat: null,
  isLoading: false,
  isRefreshing: false,
  isCreating: false,
  isDetailLoading: false,
  deletingChatId: null,
  errorMessage: null,
  detailErrorMessage: null,
  loadChats: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const chats = await chatApi.getChats();
      set({ chats: sortChats(chats), isLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  refreshChats: async () => {
    set({ isRefreshing: true, errorMessage: null });

    try {
      const chats = await chatApi.getChats();
      set({ chats: sortChats(chats), isRefreshing: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isRefreshing: false });
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
        selectedChat: state.selectedChat ? applyPatch(state.selectedChat) : state.selectedChat
      };
    });
  }
}));
