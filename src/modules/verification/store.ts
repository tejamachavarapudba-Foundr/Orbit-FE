import { create } from "zustand";

import { verificationApi } from "@/modules/verification/api";
import { SubmitFounderVerificationPayload, VerificationStatus } from "@/modules/verification/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type VerificationState = {
  status: VerificationStatus | null;
  isLoading: boolean;
  isStartingIdentity: boolean;
  isSubmittingFounder: boolean;
  errorMessage: string | null;
  loadStatus: () => Promise<void>;
  startIdentityVerification: () => Promise<string | null>;
  submitFounderVerification: (payload: SubmitFounderVerificationPayload) => Promise<boolean>;
};

export const useVerificationStore = create<VerificationState>((set) => ({
  status: null,
  isLoading: false,
  isStartingIdentity: false,
  isSubmittingFounder: false,
  errorMessage: null,
  loadStatus: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const status = await verificationApi.getStatus();
      set({ status, isLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  startIdentityVerification: async () => {
    set({ isStartingIdentity: true, errorMessage: null });

    try {
      const url = await verificationApi.getIdentityUrl();
      set({ isStartingIdentity: false });
      return url;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isStartingIdentity: false });
      useToastStore.getState().show({ type: "error", title: "Identity verification unavailable", message: appError.message });
      return null;
    }
  },
  submitFounderVerification: async (payload) => {
    set({ isSubmittingFounder: true, errorMessage: null });

    try {
      await verificationApi.submitFounderVerification(payload);
      const status = await verificationApi.getStatus();
      set({ status, isSubmittingFounder: false });
      useToastStore.getState().show({ type: "success", title: "Certificate submitted", message: "We'll review it shortly." });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isSubmittingFounder: false });
      useToastStore.getState().show({ type: "error", title: "Submission failed", message: appError.message });
      return false;
    }
  }
}));
