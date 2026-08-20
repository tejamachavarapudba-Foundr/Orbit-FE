import { apiClient } from "@/services/api/client";
import {
  CancelledListResponse,
  CreateProposalPayload,
  GoogleConnectionStatus,
  Meeting,
  MeetingProposal,
  MeetingsTab,
  OpenSlotsResponse,
  RespondProposalPayload,
  SaveAvailabilityPayload,
  UpcomingListResponse
} from "@/modules/meeting/types";

export const googleApi = {
  getAuthUrl: async () => {
    const response = await apiClient.get<{ url: string }>("/google/oauth/url");
    return response.data.url;
  },
  getStatus: async () => {
    const response = await apiClient.get<GoogleConnectionStatus>("/google/oauth/status");
    return response.data;
  },
  disconnect: async () => {
    const response = await apiClient.delete<{ success: boolean }>("/google/oauth/disconnect");
    return response.data;
  }
};

export const meetingApi = {
  getMyAvailability: async () => {
    const response = await apiClient.get("/meetings/availability/me");
    return response.data;
  },
  saveAvailability: async (payload: SaveAvailabilityPayload) => {
    const response = await apiClient.put("/meetings/availability", payload);
    return response.data;
  },
  getOpenSlotsFor: async (profileId: string) => {
    const response = await apiClient.get<OpenSlotsResponse>(`/meetings/availability/${profileId}/open-slots`);
    return response.data;
  },
  createProposal: async (payload: CreateProposalPayload) => {
    const response = await apiClient.post<{ proposal: MeetingProposal; meeting?: Meeting } | MeetingProposal>(
      "/meetings/proposals",
      payload
    );
    return response.data;
  },
  getProposal: async (id: string) => {
    const response = await apiClient.get<MeetingProposal>(`/meetings/proposals/${id}`);
    return response.data;
  },
  respondToProposal: async (id: string, payload: RespondProposalPayload) => {
    const response = await apiClient.post(`/meetings/proposals/${id}/respond`, payload);
    return response.data;
  },
  withdrawProposal: async (id: string) => {
    const response = await apiClient.delete(`/meetings/proposals/${id}`);
    return response.data;
  },
  cancelMeeting: async (id: string, reason?: string) => {
    const response = await apiClient.post<Meeting>(`/meetings/${id}/cancel`, { reason });
    return response.data;
  },
  listMine: async (tab: MeetingsTab) => {
    const response = await apiClient.get<Meeting[] | UpcomingListResponse | CancelledListResponse>("/meetings/mine", {
      params: { tab }
    });
    return response.data;
  }
};
