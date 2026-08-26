export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentKey?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentSize?: number | null;
  readAt: string | null;
  createdAt: string;
};

export type CreateMessagePayload = {
  conversationId: string;
  content: string;
  attachmentUrl?: string;
  attachmentKey?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
};
