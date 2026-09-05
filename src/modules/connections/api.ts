import { apiClient } from "@/services/api/client";
import { normalizeAuthProfile } from "@/modules/profile/normalizeProfile";
import {
  ConnectionCountResponse,
  ConnectionRequest,
  ConnectionStatusResponse,
  SendConnectionRequestPayload
} from "@/modules/connections/types";
import { FollowProfile } from "@/modules/follows/types";
import { followsApi } from "@/modules/follows/api";

const normalizeRequest = (raw: ConnectionRequest & Record<string, unknown>): ConnectionRequest => ({
  id: String(raw.id),
  requesterId: String(raw.requesterId ?? raw.requester_id ?? ""),
  recipientId: String(raw.recipientId ?? raw.recipient_id ?? ""),
  note: String(raw.note ?? ""),
  status: (raw.status as ConnectionRequest["status"]) ?? "pending",
  createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  requester: raw.requester ? normalizeAuthProfile(raw.requester as FollowProfile & Record<string, unknown>) : undefined,
  recipient: raw.recipient ? normalizeAuthProfile(raw.recipient as FollowProfile & Record<string, unknown>) : undefined
});

const isNotFound = (error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 404 || status === 405;
};

export const connectionsApi = {
  sendRequest: async (payload: SendConnectionRequestPayload) => {
    const response = await apiClient.post<ConnectionRequest>("/connections/requests", payload);
    return normalizeRequest(response.data as ConnectionRequest & Record<string, unknown>);
  },
  getIncomingRequests: async () => {
    const response = await apiClient.get<ConnectionRequest[]>("/connections/requests/incoming");
    return response.data.map((item) => normalizeRequest(item as ConnectionRequest & Record<string, unknown>));
  },
  getOutgoingRequests: async () => {
    const response = await apiClient.get<ConnectionRequest[]>("/connections/requests/outgoing");
    return response.data.map((item) => normalizeRequest(item as ConnectionRequest & Record<string, unknown>));
  },
  acceptRequest: async (requestId: string) => {
    const response = await apiClient.post<ConnectionRequest>(`/connections/requests/${requestId}/accept`);
    return normalizeRequest(response.data as ConnectionRequest & Record<string, unknown>);
  },
  declineRequest: async (requestId: string) => {
    const response = await apiClient.post<ConnectionRequest>(`/connections/requests/${requestId}/decline`);
    return normalizeRequest(response.data as ConnectionRequest & Record<string, unknown>);
  },
  cancelRequest: async (requestId: string) => {
    const response = await apiClient.delete<ConnectionRequest>(`/connections/requests/${requestId}`);
    return normalizeRequest(response.data as ConnectionRequest & Record<string, unknown>);
  },
  getStatus: async (userId: string): Promise<ConnectionStatusResponse> => {
    try {
      const response = await apiClient.get<ConnectionStatusResponse>(`/connections/status/${userId}`);
      return response.data;
    } catch (error) {
      if (!isNotFound(error)) {
        throw error;
      }

      const followStatus = await followsApi.getStatus(userId);
      return { status: followStatus.isFollowing ? "connected" : "none" };
    }
  },
  getConnectionCount: async (userId: string): Promise<number> => {
    try {
      const response = await apiClient.get<ConnectionCountResponse>(`/connections/count/${userId}`);
      return response.data.count;
    } catch (error) {
      if (!isNotFound(error)) {
        throw error;
      }

      const [followers, following] = await Promise.all([
        followsApi.getFollowers(userId),
        followsApi.getFollowing(userId)
      ]);
      const followerIds = new Set(followers.map((profile) => profile.id));
      return following.filter((profile) => followerIds.has(profile.id)).length;
    }
  },
  getBulkInfo: async (userIds: string[]) => {
    if (userIds.length === 0) return {};
    const response = await apiClient.post<Record<string, ConnectionStatusResponse & { count: number }>>(
      "/connections/bulk-info",
      { userIds }
    );
    return response.data;
  },
  getConnectedProfiles: async (userId: string) => {
    try {
      const response = await apiClient.get<FollowProfile[]>(`/connections/${userId}`);
      return response.data.map((profile) => normalizeAuthProfile(profile as FollowProfile & Record<string, unknown>));
    } catch (error) {
      if (!isNotFound(error)) {
        throw error;
      }

      const [followers, following] = await Promise.all([
        followsApi.getFollowers(userId),
        followsApi.getFollowing(userId)
      ]);
      const followerIds = new Set(followers.map((profile) => profile.id));
      return following.filter((profile) => followerIds.has(profile.id));
    }
  }
};
