import { useEffect, useRef } from "react";

import { useCommunityStore } from "@/modules/community/store";

export const useCommunities = () => {
  const communities = useCommunityStore((state) => state.communities);
  const isLoading = useCommunityStore((state) => state.isLoading);
  const isCreating = useCommunityStore((state) => state.isCreating);
  const errorMessage = useCommunityStore((state) => state.errorMessage);
  const loadCommunities = useCommunityStore((state) => state.loadCommunities);
  const createCommunity = useCommunityStore((state) => state.createCommunity);
  const hasRequestedRef = useRef(false);

  // Fires once per mount — gating on "communities.length === 0" instead would
  // never converge for an account with genuinely zero communities: every load
  // resolves back to length 0, which re-satisfies the condition and fires
  // the request again forever.
  useEffect(() => {
    if (hasRequestedRef.current || isLoading) {
      return;
    }
    hasRequestedRef.current = true;
    void loadCommunities();
  }, [isLoading, loadCommunities]);

  return { communities, isLoading, isCreating, errorMessage, loadCommunities, createCommunity };
};

export const useCommunityDetail = (id: string | undefined) => {
  const selectedCommunity = useCommunityStore((state) => state.selectedCommunity);
  const mutatingId = useCommunityStore((state) => state.mutatingId);
  const selectCommunity = useCommunityStore((state) => state.selectCommunity);
  const clearSelectedCommunity = useCommunityStore((state) => state.clearSelectedCommunity);
  const addMembers = useCommunityStore((state) => state.addMembers);

  useEffect(() => {
    if (id) {
      void selectCommunity(id);
    }
    return () => clearSelectedCommunity();
  }, [id, selectCommunity, clearSelectedCommunity]);

  return { community: selectedCommunity, mutatingId, addMembers };
};
