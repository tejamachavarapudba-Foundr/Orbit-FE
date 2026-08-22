import { useEffect } from "react";

import { useVerificationStore } from "@/modules/verification/store";

export const useVerificationStatus = () => {
  const status = useVerificationStore((state) => state.status);
  const isLoading = useVerificationStore((state) => state.isLoading);
  const isStartingIdentity = useVerificationStore((state) => state.isStartingIdentity);
  const isSubmittingFounder = useVerificationStore((state) => state.isSubmittingFounder);
  const loadStatus = useVerificationStore((state) => state.loadStatus);
  const startIdentityVerification = useVerificationStore((state) => state.startIdentityVerification);
  const submitFounderVerification = useVerificationStore((state) => state.submitFounderVerification);

  useEffect(() => {
    if (!status && !isLoading) {
      void loadStatus();
    }
  }, [status, isLoading, loadStatus]);

  return {
    status,
    isLoading,
    isStartingIdentity,
    isSubmittingFounder,
    loadStatus,
    startIdentityVerification,
    submitFounderVerification
  };
};
