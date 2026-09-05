import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { connectionsApi } from "@/modules/connections/api";
import { ConnectionRequest, ConnectionStatus, ConnectionStatusResponse } from "@/modules/connections/types";
import { useAuthStore } from "@/modules/auth/store";
import { followsApi } from "@/modules/follows/api";
import { useFollowStore } from "@/modules/follows/store";
import { FollowProfile } from "@/modules/follows/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

const INCOMING_KEY = ["connections", "incoming"] as const;
const statusKey = (userId: string) => ["connections", "status", userId] as const;
const countKey = (userId: string) => ["connections", "count", userId] as const;
const connectedKey = (userId: string) => ["connections", "connected", userId] as const;

export const useConnectionCount = (userId: string | undefined) => {
  const { data } = useQuery({
    queryKey: countKey(userId ?? ""),
    queryFn: () => connectionsApi.getConnectionCount(userId as string),
    enabled: Boolean(userId)
  });

  return data;
};

export const useConnectedProfiles = (userId: string | undefined) => {
  const { data } = useQuery({
    queryKey: connectedKey(userId ?? ""),
    queryFn: () => connectionsApi.getConnectedProfiles(userId as string),
    enabled: Boolean(userId)
  });

  const connectedProfiles: FollowProfile[] = data ?? [];
  return connectedProfiles;
};

// Shared across every screen that shows the incoming-invitations list or
// just needs its count (MainNavigator primes it, ProfileMenuButton reads
// the badge count, InvitationsScreen renders it, and every profile card's
// useConnectionAction checks it for an incoming request from that profile)
// — React Query dedupes these into one cached list instead of each needing
// its own imperative load call in the right order.
export const useIncomingConnectionRequests = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const { data, isLoading, refetch } = useQuery({
    queryKey: INCOMING_KEY,
    queryFn: connectionsApi.getIncomingRequests,
    enabled: options?.enabled ?? true
  });
  const incomingRequests: ConnectionRequest[] = data ?? [];

  const acceptMutation = useMutation({
    mutationFn: async (request: ConnectionRequest) => {
      await connectionsApi.acceptRequest(request.id);

      const requester = request.requester;
      if (requester) {
        await useFollowStore.getState().followUser(requester);
      } else {
        await followsApi.followUser(request.requesterId);
      }

      return request;
    },
    onSuccess: (request) => {
      queryClient.setQueryData<ConnectionRequest[]>(INCOMING_KEY, (old: ConnectionRequest[] | undefined) =>
        old?.filter((item) => item.id !== request.id)
      );
      queryClient.setQueryData<ConnectionStatusResponse>(statusKey(request.requesterId), { status: "connected" });
      if (request.requester) {
        const requester = request.requester;
        queryClient.setQueryData<FollowProfile[]>(connectedKey(request.recipientId), (old: FollowProfile[] | undefined) =>
          (old ?? []).some((profile) => profile.id === requester.id) ? old : [requester, ...(old ?? [])]
        );
      }
      void queryClient.invalidateQueries({ queryKey: countKey(request.requesterId) });
      void queryClient.invalidateQueries({ queryKey: countKey(request.recipientId) });

      showToast({
        type: "success",
        title: "Connected",
        message: `You and ${request.requester?.fullName ?? "this member"} are now connected.`
      });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Accept failed", message: toAppError(error).message });
    }
  });

  const declineMutation = useMutation({
    mutationFn: (request: ConnectionRequest) => connectionsApi.declineRequest(request.id),
    onSuccess: (_data, request) => {
      queryClient.setQueryData<ConnectionRequest[]>(INCOMING_KEY, (old: ConnectionRequest[] | undefined) =>
        old?.filter((item) => item.id !== request.id)
      );
      queryClient.setQueryData<ConnectionStatusResponse>(statusKey(request.requesterId), { status: "none" });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Decline failed", message: toAppError(error).message });
    }
  });

  const mutatingRequesterId =
    (acceptMutation.isPending ? acceptMutation.variables?.requesterId : null) ??
    (declineMutation.isPending ? declineMutation.variables?.requesterId : null) ??
    null;

  const acceptRequest = useCallback(
    async (request: ConnectionRequest) => {
      try {
        await acceptMutation.mutateAsync(request);
        return true;
      } catch {
        return false;
      }
    },
    [acceptMutation]
  );

  const declineRequest = useCallback(
    async (request: ConnectionRequest) => {
      try {
        await declineMutation.mutateAsync(request);
        return true;
      } catch {
        return false;
      }
    },
    [declineMutation]
  );

  return { incomingRequests, isLoadingRequests: isLoading, mutatingRequesterId, acceptRequest, declineRequest, reload: refetch };
};

export const useConnectionAction = (profile: FollowProfile) => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isSelf = currentUserId === profile.id;

  const { data: statusResponse, isLoading: isStatusQueryLoading } = useQuery({
    queryKey: statusKey(profile.id),
    queryFn: () => connectionsApi.getStatus(profile.id),
    enabled: !isSelf
  });

  const { incomingRequests, acceptRequest, declineRequest } = useIncomingConnectionRequests();

  const incomingRequest = incomingRequests.find(
    (request) =>
      (request.requesterId === profile.id || request.requester?.id === profile.id) &&
      request.status?.toLowerCase() === "pending"
  );

  const sendMutation = useMutation({
    mutationFn: (note: string) => connectionsApi.sendRequest({ recipientId: profile.id, note: note.trim() }),
    onSuccess: (request, note) => {
      queryClient.setQueryData<ConnectionStatusResponse>(statusKey(profile.id), {
        status: "outgoing_pending",
        requestId: request.id,
        note: note.trim()
      });
      showToast({ type: "success", title: "Request sent", message: `Your connection note was sent to ${profile.fullName}.` });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Request failed", message: toAppError(error).message });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const requestId = statusResponse?.requestId;
      if (!requestId) return;
      await connectionsApi.cancelRequest(requestId);
    },
    onSuccess: () => {
      queryClient.setQueryData<ConnectionStatusResponse>(statusKey(profile.id), { status: "none" });
      showToast({ type: "success", title: "Request cancelled", message: "Your connection invitation was successfully retracted." });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Cancellation failed", message: toAppError(error).message });
    }
  });

  const status: ConnectionStatus = statusResponse?.status ?? "none";

  const openConnectModal = useCallback(() => setIsModalOpen(true), []);
  const closeConnectModal = useCallback(() => setIsModalOpen(false), []);

  const submitConnectNote = useCallback(
    async (note: string) => {
      try {
        await sendMutation.mutateAsync(note);
        setIsModalOpen(false);
        return true;
      } catch {
        return false;
      }
    },
    [sendMutation]
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

  const cancelOutgoing = useCallback(async () => {
    try {
      await cancelMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }, [cancelMutation]);

  return {
    isSelf,
    status,
    isStatusLoading: isStatusQueryLoading && !isSelf,
    isMutating: sendMutation.isPending || cancelMutation.isPending,
    isModalOpen,
    incomingNote: incomingRequest?.note ?? statusResponse?.note ?? "",
    isConnected: status === "connected",
    openConnectModal,
    closeConnectModal,
    submitConnectNote,
    acceptIncoming,
    declineIncoming,
    cancelOutgoing
  };
};

export const useCanMessageUser = (userId: string | undefined) => {
  const { data } = useQuery({
    queryKey: statusKey(userId ?? ""),
    queryFn: () => connectionsApi.getStatus(userId as string),
    enabled: Boolean(userId)
  });

  return data?.status === "connected";
};
