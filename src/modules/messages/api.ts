import { apiClient } from "@/services/api/client";
import { CreateMessagePayload, Message } from "@/modules/messages/types";

export const messagesApi = {
  getMessages: async (conversationId: string) => {
    const response = await apiClient.get<Message[]>("/messages", {
      params: { conversationId }
    });
    return response.data;
  },
  createMessage: async (payload: CreateMessagePayload) => {
    const response = await apiClient.post<Message>("/messages", payload);
    return response.data;
  },
  markRead: async (id: string) => {
    const response = await apiClient.patch<Message>(`/messages/${id}/read`, {});
    return response.data;
  },
  deleteMessage: async (id: string) => {
    const response = await apiClient.delete<Message>(`/messages/${id}`, { data: {} });
    return response.data;
  }
};
