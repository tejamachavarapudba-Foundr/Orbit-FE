import { useCallback, useEffect, useState } from "react";

import { useAuthStore } from "@/modules/auth/store";
import { Message } from "@/modules/messages/types";
import { useMessageStore } from "@/modules/messages/store";

/** Stable fallback — never use `?? []` inline in Zustand selectors (new ref every render → infinite loop). */
const EMPTY_MESSAGES: Message[] = [];

export const useConversationMessages = (conversationId: string) => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const messages = useMessageStore((state) => state.messagesByConversationId[conversationId] ?? EMPTY_MESSAGES);
  const isLoading = useMessageStore((state) => state.isLoadingByConversationId[conversationId] ?? false);
  const isSending = useMessageStore((state) => state.isSendingByConversationId[conversationId] ?? false);
  const deletingMessageId = useMessageStore((state) => state.deletingMessageId);
  const readingMessageId = useMessageStore((state) => state.readingMessageId);
  const errorMessage = useMessageStore((state) => state.errorByConversationId[conversationId] ?? null);
  const loadMessages = useMessageStore((state) => state.loadMessages);
  const sendMessage = useMessageStore((state) => state.sendMessage);
  const markConversationRead = useMessageStore((state) => state.markConversationRead);
  const deleteMessage = useMessageStore((state) => state.deleteMessage);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    void loadMessages(conversationId);
  }, [conversationId, loadMessages]);

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
