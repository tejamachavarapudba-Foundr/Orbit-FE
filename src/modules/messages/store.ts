import { create } from "zustand";

import { messagesApi } from "@/modules/messages/api";
import { Message } from "@/modules/messages/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type MessageState = {
  messagesByConversationId: Record<string, Message[]>;
  isLoadingByConversationId: Record<string, boolean>;
  isSendingByConversationId: Record<string, boolean>;
  deletingMessageId: string | null;
  readingMessageId: string | null;
  errorByConversationId: Record<string, string | null>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<boolean>;
  markRead: (messageId: string, conversationId: string) => Promise<boolean>;
  deleteMessage: (messageId: string, conversationId: string) => Promise<boolean>;
};

const sortMessages = (messages: Message[]) =>
  [...messages].sort((first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime());

export const useMessageStore = create<MessageState>((set) => ({
  messagesByConversationId: {},
  isLoadingByConversationId: {},
  isSendingByConversationId: {},
  deletingMessageId: null,
  readingMessageId: null,
  errorByConversationId: {},
  loadMessages: async (conversationId) => {
    set((state) => ({
      isLoadingByConversationId: { ...state.isLoadingByConversationId, [conversationId]: true },
      errorByConversationId: { ...state.errorByConversationId, [conversationId]: null }
    }));

    try {
      const messages = await messagesApi.getMessages(conversationId);
      set((state) => ({
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conversationId]: sortMessages(messages)
        },
        isLoadingByConversationId: { ...state.isLoadingByConversationId, [conversationId]: false }
      }));
    } catch (error) {
      const appError = toAppError(error);
      set((state) => ({
        errorByConversationId: { ...state.errorByConversationId, [conversationId]: appError.message },
        isLoadingByConversationId: { ...state.isLoadingByConversationId, [conversationId]: false }
      }));
    }
  },
  sendMessage: async (conversationId, content) => {
    set((state) => ({
      isSendingByConversationId: { ...state.isSendingByConversationId, [conversationId]: true },
      errorByConversationId: { ...state.errorByConversationId, [conversationId]: null }
    }));

    try {
      const message = await messagesApi.createMessage({ conversationId, content });
      set((state) => ({
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conversationId]: sortMessages([...(state.messagesByConversationId[conversationId] ?? []), message])
        },
        isSendingByConversationId: { ...state.isSendingByConversationId, [conversationId]: false }
      }));
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set((state) => ({
        errorByConversationId: { ...state.errorByConversationId, [conversationId]: appError.message },
        isSendingByConversationId: { ...state.isSendingByConversationId, [conversationId]: false }
      }));
      useToastStore.getState().show({ type: "error", title: "Message failed", message: appError.message });
      return false;
    }
  },
  markRead: async (messageId, conversationId) => {
    const optimisticReadAt = new Date().toISOString();

    set((state) => ({
      readingMessageId: messageId,
      messagesByConversationId: {
        ...state.messagesByConversationId,
        [conversationId]: (state.messagesByConversationId[conversationId] ?? []).map((item) =>
          item.id === messageId ? { ...item, readAt: optimisticReadAt } : item
        )
      }
    }));

    try {
      const message = await messagesApi.markRead(messageId);
      set((state) => ({
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conversationId]: (state.messagesByConversationId[conversationId] ?? []).map((item) =>
            item.id === message.id ? message : item
          )
        },
        readingMessageId: null
      }));
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set((state) => ({
        errorByConversationId: { ...state.errorByConversationId, [conversationId]: appError.message },
        readingMessageId: null
      }));
      return false;
    }
  },
  deleteMessage: async (messageId, conversationId) => {
    set({ deletingMessageId: messageId });

    try {
      await messagesApi.deleteMessage(messageId);
      set((state) => ({
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conversationId]: (state.messagesByConversationId[conversationId] ?? []).filter((item) => item.id !== messageId)
        },
        deletingMessageId: null
      }));
      useToastStore.getState().show({ type: "success", title: "Message deleted" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set((state) => ({
        errorByConversationId: { ...state.errorByConversationId, [conversationId]: appError.message },
        deletingMessageId: null
      }));
      useToastStore.getState().show({ type: "error", title: "Delete failed", message: appError.message });
      return false;
    }
  }
}));
