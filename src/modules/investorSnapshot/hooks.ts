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

  const loadSnapshot =
    useInvestorSnapshotStore(
      (state) => state.loadSnapshot
    );

  const updateSnapshot =
    useInvestorSnapshotStore(
      (state) => state.updateSnapshot
    );

  return {
    snapshot,
    isLoading,
    isSaving,
    loadSnapshot,
    updateSnapshot,
  };
};