import { create } from "zustand";

import { connectionsApi } from "@/modules/connections/api";
import { ConnectionRequest, ConnectionStatus } from "@/modules/connections/types";
import { followsApi } from "@/modules/follows/api";
import { FollowProfile } from "@/modules/follows/types";
import { useFollowStore } from "@/modules/follows/store";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type ConnectionsState = {
  statusByUserId: Record<string, ConnectionStatus>;
  requestIdByUserId: Record<string, string>;
  noteByUserId: Record<string, string>;
  countByUserId: Record<string, number>;
  incomingRequests: ConnectionRequest[];
  connectedProfiles: FollowProfile[];
  isLoadingRequests: boolean;
  isMutatingByUserId: Record<string, boolean>;
  errorMessage: string | null;
  loadIncomingRequests: () => Promise<void>;
  loadConnectedProfiles: (userId: string) => Promise<void>;
  fetchStatus: (userId: string) => Promise<void>;
  fetchCount: (userId: string) => Promise<void>;
  sendRequest: (recipient: FollowProfile, note: string) => Promise<boolean>;
  acceptRequest: (request: ConnectionRequest) => Promise<boolean>;
  declineRequest: (request: ConnectionRequest) => Promise<boolean>;
  cancelOutgoing: (userId: string) => Promise<boolean>;
  isConnected: (userId: string) => boolean;
};

export const useConnectionsStore = create<ConnectionsState>((set, get) => ({
  statusByUserId: {},
  requestIdByUserId: {},
  noteByUserId: {},
  countByUserId: {},
  incomingRequests: [],
  connectedProfiles: [],
  isLoadingRequests: false,
  isMutatingByUserId: {},
  errorMessage: null,
  loadIncomingRequests: async () => {
    set({ isLoadingRequests: true, errorMessage: null });

    try {
      const incomingRequests = await connectionsApi.getIncomingRequests();
      set((state) => ({
        incomingRequests,
        isLoadingRequests: false,
        statusByUserId: {
          ...state.statusByUserId,
          ...Object.fromEntries(
            incomingRequests
              // 🌟 FIX: Safe casing lookup & absolute fallback for target requester fields
              .filter((request) => request.status?.toLowerCase() === "pending")
              .map((request) => {
                const requesterId = request.requesterId || request.requester?.id;
                return [requesterId, "pending_incoming" as ConnectionStatus];
              })
          )
        },
        requestIdByUserId: {
          ...state.requestIdByUserId,
          ...Object.fromEntries(incomingRequests.map((request) => [request.requesterId, request.id]))
        },
        noteByUserId: {
          ...state.noteByUserId,
          ...Object.fromEntries(incomingRequests.map((request) => [request.requesterId, request.note]))
        }
      }));
    } catch (error) {
      const appError = toAppError(error);
      set({ isLoadingRequests: false, errorMessage: appError.message });
    }
  },
  loadConnectedProfiles: async (userId) => {
    try {
      const connectedProfiles = await connectionsApi.getConnectedProfiles(userId);
      set((state) => ({
        connectedProfiles,
        statusByUserId: {
          ...state.statusByUserId,
          ...Object.fromEntries(connectedProfiles.map((profile) => [profile.id, "connected" as ConnectionStatus]))
        }
      }));
    } catch {
      // keep existing state
    }
  },
  fetchStatus: async (userId) => {
    if (get().statusByUserId[userId] !== undefined && get().isMutatingByUserId[userId]) {
      return;
    }

    try {
      const response = await connectionsApi.getStatus(userId);
      set((state) => ({
        statusByUserId: { ...state.statusByUserId, [userId]: response.status },
        requestIdByUserId: response.requestId
          ? { ...state.requestIdByUserId, [userId]: response.requestId }
          : state.requestIdByUserId,
        noteByUserId: response.note ? { ...state.noteByUserId, [userId]: response.note } : state.noteByUserId
      }));
    } catch {
      set((state) => ({
        statusByUserId: { ...state.statusByUserId, [userId]: "none" }
      }));
    }
  },
  fetchCount: async (userId) => {
    try {
      const count = await connectionsApi.getConnectionCount(userId);
      set((state) => ({
        countByUserId: { ...state.countByUserId, [userId]: count }
      }));
    } catch {
      set((state) => ({
        countByUserId: { ...state.countByUserId, [userId]: 0 }
      }));
    }
  },
  sendRequest: async (recipient, note) => {
    set((state) => ({
      isMutatingByUserId: { ...state.isMutatingByUserId, [recipient.id]: true },
      errorMessage: null
    }));

    try {
      const request = await connectionsApi.sendRequest({ recipientId: recipient.id, note: note.trim() });
      set((state) => ({
        statusByUserId: { ...state.statusByUserId, [recipient.id]: "pending_outgoing" },
        requestIdByUserId: { ...state.requestIdByUserId, [recipient.id]: request.id },
        noteByUserId: { ...state.noteByUserId, [recipient.id]: note.trim() },
        isMutatingByUserId: { ...state.isMutatingByUserId, [recipient.id]: false }
      }));
      useToastStore.getState().show({
        type: "success",
        title: "Request sent",
        message: `Your connection note was sent to ${recipient.fullName}.`
      });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set((state) => ({
        errorMessage: appError.message,
        isMutatingByUserId: { ...state.isMutatingByUserId, [recipient.id]: false }
      }));
      useToastStore.getState().show({ type: "error", title: "Request failed", message: appError.message });
      return false;
    }
  },
  acceptRequest: async (request) => {
    set((state) => ({
      isMutatingByUserId: { ...state.isMutatingByUserId, [request.requesterId]: true }
    }));

    try {
      await connectionsApi.acceptRequest(request.id);

      const requester = request.requester;
      if (requester) {
        await useFollowStore.getState().followUser(requester);
      } else {
        await followsApi.followUser(request.requesterId);
      }

      set((state) => ({
        incomingRequests: state.incomingRequests.filter((item) => item.id !== request.id),
        statusByUserId: { ...state.statusByUserId, [request.requesterId]: "connected" },
        connectedProfiles: requester
          ? state.connectedProfiles.some((profile) => profile.id === requester.id)
            ? state.connectedProfiles
            : [requester, ...state.connectedProfiles]
          : state.connectedProfiles,
        isMutatingByUserId: { ...state.isMutatingByUserId, [request.requesterId]: false }
      }));

      void get().fetchCount(request.requesterId);
      void get().fetchCount(request.recipientId);

      useToastStore.getState().show({
        type: "success",
        title: "Connected",
        message: `You and ${request.requester?.fullName ?? "this member"} are now connected.`
      });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set((state) => ({
        isMutatingByUserId: { ...state.isMutatingByUserId, [request.requesterId]: false }
      }));
      useToastStore.getState().show({ type: "error", title: "Accept failed", message: appError.message });
      return false;
    }
  },
  declineRequest: async (request) => {
    try {
      await connectionsApi.declineRequest(request.id);
      set((state) => ({
        incomingRequests: state.incomingRequests.filter((item) => item.id !== request.id),
        statusByUserId: { ...state.statusByUserId, [request.requesterId]: "none" },
        requestIdByUserId: Object.fromEntries(
          Object.entries(state.requestIdByUserId).filter(([userId]) => userId !== request.requesterId)
        )
      }));
      return true;
    } catch (error) {
      const appError = toAppError(error);
      useToastStore.getState().show({ type: "error", title: "Decline failed", message: appError.message });
      return false;
    }
  },
  cancelOutgoing: async (userId) => {
    const requestId = get().requestIdByUserId[userId];
    if (!requestId) {
      return false;
    }

    try {
      await connectionsApi.cancelRequest(requestId);
      set((state) => ({
        statusByUserId: { ...state.statusByUserId, [userId]: "none" },
        requestIdByUserId: Object.fromEntries(Object.entries(state.requestIdByUserId).filter(([id]) => id !== userId))
      }));
      return true;
    } catch {
      return false;
    }
  },
  isConnected: (userId) => get().statusByUserId[userId] === "connected"
}));
