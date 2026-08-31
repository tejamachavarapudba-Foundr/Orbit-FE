import { create } from "zustand";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";
import { investorSnapshotApi } from "./api";
import { InvestorSnapshot } from "./types";

type InvestorSnapshotState = {
  snapshot: InvestorSnapshot | null;

  isLoading: boolean;
  isSaving: boolean;
  isExtracting: boolean;

  loadSnapshot: (
    projectId: string
  ) => Promise<void>;

  updateSnapshot: (
    projectId: string,
    payload: Partial<InvestorSnapshot>
  ) => Promise<boolean>;

  extractFromPdf: (
    projectId: string,
    file: { uri: string; name: string; mimeType?: string | null | undefined }
  ) => Promise<number>;
};

export const useInvestorSnapshotStore =
  create<InvestorSnapshotState>((set) => ({
    snapshot: null,

    isLoading: false,
    isSaving: false,
    isExtracting: false,

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

    extractFromPdf: async (projectId, file) => {
      set({ isExtracting: true });

      try {
        const extracted = await investorSnapshotApi.extractFromPdf(projectId, file);

        // Only keep fields the model actually found something for — null,
        // an empty string, or an empty array means "not present in the
        // deck," and writing those over fields the founder already filled
        // in by hand would erase their work instead of adding to it.
        const nonEmpty: Partial<InvestorSnapshot> = {};
        let filledCount = 0;

        Object.entries(extracted).forEach(([key, value]) => {
          const isEmpty =
            value === null ||
            value === undefined ||
            (typeof value === "string" && value.trim() === "") ||
            (Array.isArray(value) && value.length === 0);

          if (!isEmpty) {
            (nonEmpty as Record<string, unknown>)[key] = value;
            filledCount += 1;
          }
        });

        if (filledCount > 0) {
          const snapshot = await investorSnapshotApi.updateSnapshot(projectId, nonEmpty);
          set({ snapshot });
        }

        set({ isExtracting: false });
        return filledCount;
      } catch (error) {
        set({ isExtracting: false });

        useToastStore.getState().show({
          type: "error",
          title: "Couldn't read this PDF",
          message: toAppError(error).message,
        });

        return 0;
      }
    },
  }));