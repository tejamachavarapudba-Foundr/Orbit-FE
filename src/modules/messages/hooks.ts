import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuthStore } from "@/modules/auth/store";
import { useMessageStore } from "@/modules/messages/store";

export const useConversationMessages = (conversationId: string) => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const messages = useMessageStore((state) => state.messagesByConversationId[conversationId] ?? []);
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

  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      void loadMessages(conversationId);
    }
  }, [conversationId, isLoading, loadMessages, messages.length]);

  const unreadIncomingMessages = useMemo(
    () => messages.filter((message) => message.senderId !== currentUserId && !message.readAt),
    [currentUserId, messages]
  );

  useEffect(() => {
    unreadIncomingMessages.forEach((message) => {
      void markRead(message.id, conversationId);
    });
  }, [conversationId, markRead, unreadIncomingMessages]);

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

  const remove = useCallback(
    (messageId: string) => deleteMessage(messageId, conversationId),
    [conversationId, deleteMessage]
  );

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
    deleteMessage: remove,
    reload: () => loadMessages(conversationId)
  };
};
