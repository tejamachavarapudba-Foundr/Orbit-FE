import { apiClient } from "@/services/api/client";

import {
  MeetingRequest,
  MeetingRequestPayload,
  MeetingStatus,
} from "@/modules/meeting/types";

export const meetingApi = {
  /**
   * Investor
   * Create Meeting Request
   */
  createMeeting: async (
    payload: MeetingRequestPayload,
  ) => {
    const response =
      await apiClient.post<MeetingRequest>(
        "/meeting-requests",
        payload,
      );

    return response.data;
  },

  /**
   * Investor
   * My Requests
   */
  getMyMeetings: async () => {
    const response =
      await apiClient.get<MeetingRequest[]>(
        "/meeting-requests/my",
      );

    return response.data;
  },

  /**
   * Founder
   * Incoming Requests
   */
  getFounderMeetings: async (
    startupId: string,
  ) => {
    const response =
      await apiClient.get<MeetingRequest[]>(
        `/meeting-requests/startup/${startupId}`,
      );

    return response.data;
  },

  /**
   * Admin
   * All Requests
   */
  getAdminMeetings: async () => {
    const response =
      await apiClient.get<MeetingRequest[]>(
        "/meeting-requests/admin",
      );

    return response.data;
  },

  /**
   * Admin
   * Update Status
   */
  updateMeetingStatus: async (
    id: string,
    status: MeetingStatus,
  ) => {
    const response =
      await apiClient.patch<MeetingRequest>(
        `/meeting-requests/${id}/status`,
        {
          status,
        },
      );

    return response.data;
  },

  /**
   * Optional (future backend)
   */
  getMeetingById: async (
    id: string,
  ) => {
    const response =
      await apiClient.get<MeetingRequest>(
        `/meeting-requests/${id}`,
      );

    return response.data;
  },

  /**
   * Optional (future backend)
   */
  deleteMeeting: async (
    id: string,
  ) => {
    const response =
      await apiClient.delete(
        `/meeting-requests/${id}`,
      );

    return response.data;
  },
};