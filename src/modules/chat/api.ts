import { apiClient } from "@/services/api/client";
import { Chat, CreateChatPayload } from "@/modules/chat/types";

export const chatApi = {
  getChats: async () => {
    const response = await apiClient.get<Chat[]>("/chats");
    return response.data;
  },
  createChat: async (payload: CreateChatPayload) => {
    const response = await apiClient.post<Chat>("/chats", payload);
    return response.data;
  },
  getChatById: async (id: string) => {
    const response = await apiClient.get<Chat>(`/chats/${id}`);
    return response.data;
  },
  deleteChat: async (id: string) => {
    const response = await apiClient.delete<Chat>(`/chats/${id}`);
    return response.data;
  },
  getMessages: async (
    conversationId: string,
    limit = 50,
  ) => {
    const response = await apiClient.get(
      `/messages/${conversationId}`,
      {
        params: {
          limit,
        },
      },
    );
    return response.data;
  },
  
  sendMessage: async (payload: {
    conversationId: string;
    content: string;
  }) => {
    const response = await apiClient.post(
      "/messages",
      payload,
    );
  
    return response.data;
  },
  
  searchMessages: async (
    conversationId: string,
    query: string,
  ) => {
    const response = await apiClient.get(
      `/messages/${conversationId}/search`,
      {
        params: {
          q: query,
        },
      },
    );
  
    return response.data;
  },
};
// searchMessages: async (
//   conversationId: string,
//   query: string,
// ) => {
//   const response = await apiClient.get(
//     `/messages/${conversationId}/search`,
//     {
//       params: {
//         q: query,
//       },
//     },
//   );

//   return response.data;
// };
