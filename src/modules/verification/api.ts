import { apiClient } from "@/services/api/client";
import {
  PendingFounderVerification,
  PublicVerificationStatus,
  SubmitFounderVerificationPayload,
  VerificationStatus
} from "@/modules/verification/types";

type UploadResult = { url: string; path: string };

export const verificationApi = {
  getStatus: async () => {
    const response = await apiClient.get<VerificationStatus>("/verification/status");
    return response.data;
  },
  getPublicStatus: async (profileId: string) => {
    const response = await apiClient.get<PublicVerificationStatus>(`/verification/status/${profileId}`);
    return response.data;
  },
  getIdentityUrl: async () => {
    const response = await apiClient.get<{ url: string }>("/verification/identity/url");
    return response.data.url;
  },
  uploadDocument: async (formData: FormData) => {
    const response = await apiClient.post<UploadResult>("/storage/upload", formData);
    return response.data;
  },
  submitFounderVerification: async (payload: SubmitFounderVerificationPayload) => {
    const response = await apiClient.post("/verification/founder", payload);
    return response.data;
  },
  listPendingFounderVerifications: async () => {
    const response = await apiClient.get<PendingFounderVerification[]>("/verification/founder/pending");
    return response.data;
  },
  reviewFounderVerification: async (profileId: string, status: "approved" | "rejected", reviewNotes?: string) => {
    const response = await apiClient.patch(`/verification/founder/${profileId}/review`, { status, reviewNotes });
    return response.data;
  }
};
