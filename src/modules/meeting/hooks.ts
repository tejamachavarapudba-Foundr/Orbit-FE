import { useCallback, useEffect, useRef } from "react";
import { Linking } from "react-native";

import { googleApi } from "@/modules/meeting/api";
import { useMeetingsStore } from "@/modules/meeting/store";
import { MeetingsTab } from "@/modules/meeting/types";
import { useToastStore } from "@/store/toastStore";

export const getDeviceTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const useGoogleConnection = () => {
  const googleStatus = useMeetingsStore((state) => state.googleStatus);
  const loadGoogleStatus = useMeetingsStore((state) => state.loadGoogleStatus);
  const isConnecting = useRef(false);

  useEffect(() => {
    void loadGoogleStatus();
  }, [loadGoogleStatus]);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (!url.includes("oauth-callback")) return;
      isConnecting.current = false;
      void loadGoogleStatus();
      if (url.includes("status=error")) {
        useToastStore.getState().show({ type: "error", title: "Google connection failed", message: "Please try again." });
      } else {
        useToastStore.getState().show({ type: "success", title: "Google Meet connected" });
      }
    });
    return () => subscription.remove();
  }, [loadGoogleStatus]);

  const connect = useCallback(async () => {
    try {
      isConnecting.current = true;
      const url = await googleApi.getAuthUrl();
      await Linking.openURL(url);
    } catch {
      isConnecting.current = false;
      useToastStore.getState().show({ type: "error", title: "Couldn't start Google connection" });
    }
  }, []);

  const disconnect = useCallback(async () => {
    await googleApi.disconnect();
    await loadGoogleStatus();
  }, [loadGoogleStatus]);

  return {
    isConnected: googleStatus?.connected === true,
    email: googleStatus?.connected === true ? googleStatus.email : null,
    connect,
    disconnect
  };
};

export const useMyMeetings = (tab: MeetingsTab) => {
  const meetings = useMeetingsStore((state) => state.meetings);
  const pendingProposals = useMeetingsStore((state) => state.pendingProposals);
  const cancelledProposals = useMeetingsStore((state) => state.cancelledProposals);
  const isLoading = useMeetingsStore((state) => state.isLoading);
  const errorMessage = useMeetingsStore((state) => state.errorMessage);
  const loadMine = useMeetingsStore((state) => state.loadMine);
  const mutatingId = useMeetingsStore((state) => state.mutatingId);
  const withdrawProposal = useMeetingsStore((state) => state.withdrawProposal);
  const cancelMeeting = useMeetingsStore((state) => state.cancelMeeting);
  const joinMeeting = useMeetingsStore((state) => state.joinMeeting);

  useEffect(() => {
    void loadMine(tab);
  }, [tab, loadMine]);

  return {
    meetings,
    pendingProposals,
    cancelledProposals,
    isLoading,
    errorMessage,
    mutatingId,
    reload: () => loadMine(tab),
    withdrawProposal,
    cancelMeeting,
    joinMeeting
  };
};
