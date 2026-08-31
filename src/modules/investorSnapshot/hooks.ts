import { useInvestorSnapshotStore } from "./store";

export const useInvestorSnapshot = () => {
  const snapshot =
    useInvestorSnapshotStore(
      (state) => state.snapshot
    );

  const isLoading =
    useInvestorSnapshotStore(
      (state) => state.isLoading
    );

  const isSaving =
    useInvestorSnapshotStore(
      (state) => state.isSaving
    );

  const isExtracting =
    useInvestorSnapshotStore(
      (state) => state.isExtracting
    );

  const loadSnapshot =
    useInvestorSnapshotStore(
      (state) => state.loadSnapshot
    );

  const updateSnapshot =
    useInvestorSnapshotStore(
      (state) => state.updateSnapshot
    );

  const extractFromPdf =
    useInvestorSnapshotStore(
      (state) => state.extractFromPdf
    );

  return {
    snapshot,
    isLoading,
    isSaving,
    isExtracting,
    loadSnapshot,
    updateSnapshot,
    extractFromPdf,
  };
};
