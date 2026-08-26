export type ChatMessage = {
  id?: string;
  chatId?: string;
  senderId?: string;
  content?: string;
  createdAt?: string;
  readAt?: string | null;
};

export type Chat = {
  id: string;
  userAId: string;
  userBId: string;
  lastMessageAt: string;
  createdAt: string;
  archived: boolean;
  messages?: ChatMessage[];
};

export type CreateChatPayload = {
  participantId: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
};
