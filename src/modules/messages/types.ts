export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
};

export type CreateMessagePayload = {
  conversationId: string;
  content: string;
};
