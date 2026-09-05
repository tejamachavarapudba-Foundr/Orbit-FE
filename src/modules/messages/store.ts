import { create } from "zustand";

import { useAuthStore } from "@/modules/auth/store";
import { useChatStore } from "@/modules/chat/store";
import { messagesApi } from "@/modules/messages/api";
import { Message } from "@/modules/messages/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type PendingAttachment = {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
};

type MessageState = {
  messagesByConversationId: Record<string, Message[]>;
  isLoadingByConversationId: Record<string, boolean>;
  isSendingByConversationId: Record<string, boolean>;
  deletingMessageId: string | null;
  readingMessageId: string | null;
  errorByConversationId: Record<string, string | null>;
  loadMessages: (conversationId: string) => Promise<void>;
  refreshMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, attachment?: PendingAttachment) => Promise<boolean>;
  markRead: (messageId: string, conversationId: string) => Promise<boolean>;
  markConversationRead: (conversationId: string, currentUserId: string) => Promise<boolean>;
  deleteMessage: (messageId: string, conversationId: string) => Promise<boolean>;
};

const sortMessages = (messages: Message[]) =>
  [...messages].sort((first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime());

export const useMessageStore = create<MessageState>((set, get) => ({
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
  // Polling tick: unlike loadMessages, never flips isLoading (would flash
  // the skeleton every few seconds) and never clobbers a message that was
  // just optimistically added by sendMessage but hasn't round-tripped yet.
  refreshMessages: async (conversationId) => {
    try {
      const serverMessages = await messagesApi.getMessages(conversationId);
      set((state) => {
        const pendingOptimistic = (state.messagesByConversationId[conversationId] ?? []).filter((item) =>
          item.id.startsWith("optimistic-")
        );
        return {
          messagesByConversationId: {
            ...state.messagesByConversationId,
            [conversationId]: sortMessages([...serverMessages, ...pendingOptimistic])
          }
        };
      });
    } catch {
      // Silent — a failed background poll shouldn't surface an error or
      // disturb whatever's currently on screen; the next tick retries.
    }
  },
  sendMessage: async (conversationId, content, attachment) => {
    const currentUserId = useAuthStore.getState().user?.profile.id ?? "";
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      conversationId,
      senderId: currentUserId,
      content,
      // Show the local file immediately (attachmentUrl) while the real
      // upload is still in flight — replaced by the server's copy below.
      attachmentUrl: attachment?.uri ?? null,
      attachmentName: attachment?.name ?? null,
      attachmentType: attachment?.mimeType ?? null,
      attachmentSize: attachment?.size ?? null,
      readAt: null,
      createdAt: new Date().toISOString()
    };

    // Show the message immediately instead of waiting on the round trip.
    set((state) => ({
      messagesByConversationId: {
        ...state.messagesByConversationId,
        [conversationId]: sortMessages([...(state.messagesByConversationId[conversationId] ?? []), optimisticMessage])
      },
      isSendingByConversationId: { ...state.isSendingByConversationId, [conversationId]: true },
      errorByConversationId: { ...state.errorByConversationId, [conversationId]: null }
    }));

    try {
      const uploaded = attachment ? await messagesApi.uploadAttachment(attachment) : null;
      const message = await messagesApi.createMessage({
        conversationId,
        content,
        ...(uploaded
          ? {
              attachmentUrl: uploaded.url,
              attachmentKey: uploaded.path,
              attachmentName: attachment?.name ?? uploaded.originalFileName,
              attachmentType: uploaded.mimetype,
              attachmentSize: uploaded.size
            }
          : {})
      });
      set((state) => ({
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conversationId]: sortMessages(
            (state.messagesByConversationId[conversationId] ?? []).map((item) => (item.id === optimisticId ? message : item))
          )
        },
        isSendingByConversationId: { ...state.isSendingByConversationId, [conversationId]: false }
      }));
      useChatStore.getState().patchLastMessage(conversationId, {
        id: message.id,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt
      });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set((state) => ({
        // Roll back the optimistic message on failure.
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conversationId]: (state.messagesByConversationId[conversationId] ?? []).filter((item) => item.id !== optimisticId)
        },
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
      useChatStore.getState().markLastMessageRead(conversationId, message.id);
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
  markConversationRead: async (conversationId, currentUserId) => {
    const optimisticReadAt = new Date().toISOString();
    const unreadIds = (get().messagesByConversationId[conversationId] ?? [])
      .filter((item) => item.senderId !== currentUserId && !item.readAt)
      .map((item) => item.id);

    if (unreadIds.length === 0) {
      return true;
    }

    set((state) => ({
      messagesByConversationId: {
        ...state.messagesByConversationId,
        [conversationId]: (state.messagesByConversationId[conversationId] ?? []).map((item) =>
          unreadIds.includes(item.id) ? { ...item, readAt: optimisticReadAt } : item
        )
      }
    }));

    try {
      await messagesApi.markConversationRead(conversationId);
      useChatStore.getState().markLastMessageRead(conversationId, unreadIds[unreadIds.length - 1]!);
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set((state) => ({
        errorByConversationId: { ...state.errorByConversationId, [conversationId]: appError.message }
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
