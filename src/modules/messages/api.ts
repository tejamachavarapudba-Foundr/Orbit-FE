import { apiClient } from "@/services/api/client";
import { CreateMessagePayload, Message } from "@/modules/messages/types";

export type ChatUploadResult = {
  url: string;
  path: string;
  filename: string;
  originalFileName: string;
  mimetype: string;
  size: number;
};

export const messagesApi = {
  uploadAttachment: async (file: { uri: string; name: string; mimeType: string }) => {
    const formData = new FormData();
    formData.append("type", "chat");
    formData.append("file", { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);

    const response = await apiClient.post<ChatUploadResult>("/storage/upload", formData);
    return response.data;
  },
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
