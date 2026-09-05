import { useCallback, useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";

import { useAuthStore } from "@/modules/auth/store";
import { Message } from "@/modules/messages/types";
import { useMessageStore } from "@/modules/messages/store";

/** Stable fallback — never use `?? []` inline in Zustand selectors (new ref every render → infinite loop). */
const EMPTY_MESSAGES: Message[] = [];

// Lightweight polling: cheap enough to run every few seconds, no socket/
// Firestore infra needed, and simple to reason about — chosen over a
// real-time channel since chat isn't this app's primary surface.
const POLL_INTERVAL_MS = 4000;

export const useConversationMessages = (conversationId: string) => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const messages = useMessageStore((state) => state.messagesByConversationId[conversationId] ?? EMPTY_MESSAGES);
  const isLoading = useMessageStore((state) => state.isLoadingByConversationId[conversationId] ?? false);
  const isSending = useMessageStore((state) => state.isSendingByConversationId[conversationId] ?? false);
  const deletingMessageId = useMessageStore((state) => state.deletingMessageId);
  const readingMessageId = useMessageStore((state) => state.readingMessageId);
  const errorMessage = useMessageStore((state) => state.errorByConversationId[conversationId] ?? null);
  const loadMessages = useMessageStore((state) => state.loadMessages);
  const refreshMessages = useMessageStore((state) => state.refreshMessages);
  const sendMessage = useMessageStore((state) => state.sendMessage);
  const markConversationRead = useMessageStore((state) => state.markConversationRead);
  const deleteMessage = useMessageStore((state) => state.deleteMessage);
  const [draft, setDraft] = useState("");
  const isFocused = useIsFocused();

  useEffect(() => {
    void loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  // Only poll while this thread is the focused screen — no point refetching
  // a conversation the user has navigated away from.
  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const interval = setInterval(() => {
      void refreshMessages(conversationId);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [conversationId, isFocused, refreshMessages]);

  // Marks every unread message in this conversation as read in one request
  // instead of one PATCH per unread message — the optimistic update this
  // triggers clears each message's readAt locally, so this naturally stops
  // re-firing once nothing is unread anymore.
  useEffect(() => {
    if (isLoading || !currentUserId) {
      return;
    }

    const hasUnread = messages.some((message) => message.senderId !== currentUserId && !message.readAt);
    if (!hasUnread) {
      return;
    }

    void markConversationRead(conversationId, currentUserId);
  }, [conversationId, currentUserId, isLoading, markConversationRead, messages]);

  const submit = useCallback(async () => {
    const content = draft.trim();

    if (!content) {
      return false;
    }

    // The store already shows the message optimistically, so clear the
    // input the moment it's handed off rather than waiting on the round
    // trip — restore it only if the send actually fails.
    setDraft("");
    const didSucceed = await sendMessage(conversationId, content);
    if (!didSucceed) {
      setDraft(content);
    }

    return didSucceed;
  }, [conversationId, draft, sendMessage]);

  const sendAttachment = useCallback(
    async (attachment: { uri: string; name: string; mimeType: string; size: number }) => {
      const content = draft.trim();
      setDraft("");
      const didSucceed = await sendMessage(conversationId, content, attachment);
      if (!didSucceed) {
        setDraft(content);
      }

      return didSucceed;
    },
    [conversationId, draft, sendMessage]
  );

  const remove = useCallback(
    (messageId: string) => deleteMessage(messageId, conversationId),
    [conversationId, deleteMessage]
  );

  const reload = useCallback(() => loadMessages(conversationId), [conversationId, loadMessages]);

  return {
    currentUserId,
    messages,
    isLoading,
    isSending,
    deletingMessageId,
    readingMessageId,
    errorMessage,
    draft,
    setDraft,
    submit,
    sendAttachment,
    deleteMessage: remove,
    reload
  };
};
