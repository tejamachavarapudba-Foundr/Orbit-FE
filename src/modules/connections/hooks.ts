import { useCallback, useEffect, useState } from "react";

import { useConnectionsStore } from "@/modules/connections/store";
import { ConnectionRequest } from "@/modules/connections/types";
import { useAuthStore } from "@/modules/auth/store";
import { FollowProfile } from "@/modules/follows/types";

export const useConnectionCount = (userId: string | undefined) => {
  const count = useConnectionsStore((state) => (userId ? state.countByUserId[userId] : undefined));
  const fetchCount = useConnectionsStore((state) => state.fetchCount);

  useEffect(() => {
    if (userId) {
      void fetchCount(userId);
    }
  }, [fetchCount, userId]);

  return count;
};

export const useConnectionAction = (profile: FollowProfile) => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const status = useConnectionsStore((state) => state.statusByUserId[profile.id]);
  const incomingNote = useConnectionsStore((state) => state.noteByUserId[profile.id]);
  const isMutating = useConnectionsStore((state) => state.isMutatingByUserId[profile.id] ?? false);
  const fetchStatus = useConnectionsStore((state) => state.fetchStatus);
  const sendRequest = useConnectionsStore((state) => state.sendRequest);
  const acceptRequest = useConnectionsStore((state) => state.acceptRequest);
  const declineRequest = useConnectionsStore((state) => state.declineRequest);
  const cancelOutgoing = useConnectionsStore((state) => state.cancelOutgoing);
  const incomingRequests = useConnectionsStore((state) => state.incomingRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSelf = currentUserId === profile.id;

  useEffect(() => {
    if (!isSelf) {
      void fetchStatus(profile.id);
    }
  }, [fetchStatus, isSelf, profile.id]);

  const incomingRequest = incomingRequests.find(
    (request) =>
       (request.requesterId === profile.id || request.requester?.id === profile.id) && 
        request.status?.toLowerCase() === "pending"
  );

  const openConnectModal = useCallback(() => setIsModalOpen(true), []);
  const closeConnectModal = useCallback(() => setIsModalOpen(false), []);

  const submitConnectNote = useCallback(
    async (note: string) => {
      const success = await sendRequest(profile, note);
      if (success) {
        setIsModalOpen(false);
      }
      return success;
    },
    [profile, sendRequest]
  );

  const acceptIncoming = useCallback(async () => {
    if (!incomingRequest) {
      return false;
    }
    return acceptRequest(incomingRequest);
  }, [acceptRequest, incomingRequest]);

  const declineIncoming = useCallback(async () => {
    if (!incomingRequest) {
      return false;
    }
    return declineRequest(incomingRequest);
  }, [declineRequest, incomingRequest]);

  return {
    isSelf,
    status: status ?? "none",
    isStatusLoading: status === undefined && !isSelf,
    isMutating,
    isModalOpen,
    incomingNote: incomingRequest?.note ?? incomingNote ?? "",
    isConnected: status === "connected",
    openConnectModal,
    closeConnectModal,
    submitConnectNote,
    acceptIncoming,
    declineIncoming,
    cancelOutgoing: () => cancelOutgoing(profile.id)
  };
};

export const useIncomingConnectionRequests = () => {
  const incomingRequests = useConnectionsStore((state) => state.incomingRequests);
  const isLoadingRequests = useConnectionsStore((state) => state.isLoadingRequests);
  const loadIncomingRequests = useConnectionsStore((state) => state.loadIncomingRequests);
  const acceptRequest = useConnectionsStore((state) => state.acceptRequest);
  const declineRequest = useConnectionsStore((state) => state.declineRequest);

  useEffect(() => {
    void loadIncomingRequests();
  }, [loadIncomingRequests]);

  return {
    incomingRequests,
    isLoadingRequests,
    acceptRequest: (request: ConnectionRequest) => acceptRequest(request),
    declineRequest: (request: ConnectionRequest) => declineRequest(request),
    reload: loadIncomingRequests
  };
};

export const useCanMessageUser = (userId: string | undefined) => {
  const isConnected = useConnectionsStore((state) => (userId ? state.isConnected(userId) : false));
  const fetchStatus = useConnectionsStore((state) => state.fetchStatus);

  useEffect(() => {
    if (userId) {
      void fetchStatus(userId);
    }
  }, [fetchStatus, userId]);

  return isConnected;
};
