import { create } from "zustand";
import { useToastStore } from "@/store/toastStore";
import { investorSnapshotApi } from "./api";
import { InvestorSnapshot } from "./types";

type InvestorSnapshotState = {
  snapshot: InvestorSnapshot | null;

  isLoading: boolean;
  isSaving: boolean;

  loadSnapshot: (
    projectId: string
  ) => Promise<void>;

  updateSnapshot: (
    projectId: string,
    payload: Partial<InvestorSnapshot>
  ) => Promise<boolean>;
};

export const useInvestorSnapshotStore =
  create<InvestorSnapshotState>((set) => ({
    snapshot: null,

    isLoading: false,
    isSaving: false,

    loadSnapshot: async (projectId) => {
      set({ isLoading: true });

      try {
        const snapshot =
          await investorSnapshotApi.getSnapshot(
            projectId
          );

        set({
          snapshot,
          isLoading: false,
        });
      } catch (error) {
        set({
          isLoading: false,
        });
      }
    },

    updateSnapshot: async (
      projectId,
      payload
    ) => {
      set({
        isSaving: true,
      });

      try {
        const snapshot =
          await investorSnapshotApi.updateSnapshot(
            projectId,
            payload
          );

        set({
          snapshot,
          isSaving: false,
        });
        
        useToastStore.getState().show({
          type: "success",
          title: "Investor Snapshot Saved",
        });

        return true;
      } catch (error) {
        set({
          isSaving: false,
        });

        return false;
      }
    },
  }));