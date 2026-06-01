import { apiClient } from "@/services/api/client";
import { FollowProfile, FollowRelationship, FollowStatusResponse } from "@/modules/follows/types";

export const followsApi = {
  getFollowers: async (userId: string) => {
    const response = await apiClient.get<FollowProfile[]>(`/follows/followers/${userId}`);
    return response.data;
  },
  getFollowing: async (userId: string) => {
    const response = await apiClient.get<FollowProfile[]>(`/follows/following/${userId}`);
    return response.data;
  },
  followUser: async (userId: string) => {
    const response = await apiClient.post<FollowRelationship>(`/follows/${userId}`);
    return response.data;
  },
  unfollowUser: async (userId: string) => {
    const response = await apiClient.delete<FollowRelationship>(`/follows/${userId}`);
    return response.data;
  },
  getStatus: async (userId: string) => {
    const response = await apiClient.get<FollowStatusResponse>(`/follows/status/${userId}`);
    return response.data;
  }
};
