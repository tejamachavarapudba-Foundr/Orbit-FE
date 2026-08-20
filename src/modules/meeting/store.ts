import { create } from "zustand";

import { googleApi, meetingApi } from "@/modules/meeting/api";
import {
  CancelledListResponse,
  CreateProposalPayload,
  GoogleConnectionStatus,
  Meeting,
  MeetingProposal,
  MeetingsTab,
  RespondProposalPayload,
  UpcomingListResponse
} from "@/modules/meeting/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type MeetingsState = {
  googleStatus: GoogleConnectionStatus | null;
  tab: MeetingsTab;
  isLoading: boolean;
  mutatingId: string | null;
  errorMessage: string | null;
  meetings: Meeting[];
  pendingProposals: MeetingProposal[];
  cancelledProposals: MeetingProposal[];
  loadGoogleStatus: () => Promise<void>;
  setTab: (tab: MeetingsTab) => void;
  loadMine: (tab: MeetingsTab) => Promise<void>;
  createProposal: (payload: CreateProposalPayload) => Promise<boolean>;
  respondToProposal: (id: string, payload: RespondProposalPayload) => Promise<boolean>;
  withdrawProposal: (id: string) => Promise<boolean>;
  cancelMeeting: (id: string, reason?: string) => Promise<boolean>;
};

export const useMeetingsStore = create<MeetingsState>((set, get) => ({
  googleStatus: null,
  tab: "upcoming",
  isLoading: false,
  mutatingId: null,
  errorMessage: null,
  meetings: [],
  pendingProposals: [],
  cancelledProposals: [],

  loadGoogleStatus: async () => {
    try {
      const status = await googleApi.getStatus();
      set({ googleStatus: status });
    } catch {
      set({ googleStatus: { connected: false } });
    }
  },

  setTab: (tab) => set({ tab }),

  loadMine: async (tab) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const data = await meetingApi.listMine(tab);
      if (tab === "completed") {
        set({ meetings: data as Meeting[], pendingProposals: [], cancelledProposals: [], isLoading: false });
      } else if (tab === "cancelled") {
        const { meetings, proposals } = data as CancelledListResponse;
        set({ meetings, cancelledProposals: proposals, pendingProposals: [], isLoading: false });
      } else {
        const { meetings, pendingProposals } = data as UpcomingListResponse;
        set({ meetings, pendingProposals, cancelledProposals: [], isLoading: false });
      }
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },

  createProposal: async (payload) => {
    set({ isLoading: true, errorMessage: null });
    try {
      await meetingApi.createProposal(payload);
      set({ isLoading: false });
      useToastStore.getState().show({
        type: "success",
        title: payload.schedulingMode === "availability_pick" ? "Meeting booked" : "Meeting request sent"
      });
      await get().loadMine(get().tab);
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
      useToastStore.getState().show({ type: "error", title: "Couldn't create meeting", message: appError.message });
      return false;
    }
  },

  respondToProposal: async (id, payload) => {
    set({ mutatingId: id });
    try {
      await meetingApi.respondToProposal(id, payload);
      set({ mutatingId: null });
      useToastStore.getState().show({
        type: "success",
        title: payload.action === "accept" ? "Meeting confirmed" : "Response sent"
      });
      await get().loadMine(get().tab);
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ mutatingId: null });
      useToastStore.getState().show({ type: "error", title: "Couldn't respond", message: appError.message });
      return false;
    }
  },

  withdrawProposal: async (id) => {
    set({ mutatingId: id });
    try {
      await meetingApi.withdrawProposal(id);
      set({ mutatingId: null });
      useToastStore.getState().show({ type: "success", title: "Request withdrawn" });
      await get().loadMine(get().tab);
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ mutatingId: null });
      useToastStore.getState().show({ type: "error", title: "Couldn't withdraw", message: appError.message });
      return false;
    }
  },

  cancelMeeting: async (id, reason) => {
    set({ mutatingId: id });
    try {
      await meetingApi.cancelMeeting(id, reason);
      set({ mutatingId: null });
      useToastStore.getState().show({ type: "success", title: "Meeting cancelled" });
      await get().loadMine(get().tab);
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ mutatingId: null });
      useToastStore.getState().show({ type: "error", title: "Couldn't cancel", message: appError.message });
      return false;
    }
  }
}));
