import { useCallback, useEffect, useRef, useState } from "react";

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
  const markRead = useMessageStore((state) => state.markRead);
  const deleteMessage = useMessageStore((state) => state.deleteMessage);
  const [draft, setDraft] = useState("");
  const markedReadIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    markedReadIdsRef.current = new Set();
    void loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  useEffect(() => {
    if (isLoading || !currentUserId) {
      return;
    }

    for (const message of messages) {
      if (message.senderId === currentUserId || message.readAt || markedReadIdsRef.current.has(message.id)) {
        continue;
      }

      markedReadIdsRef.current.add(message.id);
      void markRead(message.id, conversationId);
    }
  }, [conversationId, currentUserId, isLoading, markRead, messages]);

  const submit = useCallback(async () => {
    const content = draft.trim();

    if (!content) {
      return false;
    }

    const didSucceed = await sendMessage(conversationId, content);
    if (didSucceed) {
      setDraft("");
    }

    return didSucceed;
  }, [conversationId, draft, sendMessage]);

  const sendAttachment = useCallback(
    async (attachment: { uri: string; name: string; mimeType: string; size: number }) => {
      const content = draft.trim();
      const didSucceed = await sendMessage(conversationId, content, attachment);
      if (didSucceed) {
        setDraft("");
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
