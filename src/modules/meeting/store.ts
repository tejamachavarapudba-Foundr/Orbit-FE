import { create } from "zustand";

import { meetingApi } from "@/modules/meeting/api";

import {
  MeetingRequest,
  MeetingRequestPayload,
  MeetingStatus,
} from "@/modules/meeting/types";

import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type MeetingStore = {
  myMeetings: MeetingRequest[];
  founderMeetings: MeetingRequest[];
  adminMeetings: MeetingRequest[];

  selectedMeeting: MeetingRequest | null;

  isLoading: boolean;
  isRefreshing: boolean;
  isSubmitting: boolean;

  errorMessage: string | null;

  loadMyMeetings: () => Promise<void>;

  loadFounderMeetings: (
    startupId: string,
  ) => Promise<void>;

  loadAdminMeetings: () => Promise<void>;

  createMeeting: (
    payload: MeetingRequestPayload,
  ) => Promise<boolean>;

  updateMeetingStatus: (
    id: string,
    status: MeetingStatus,
  ) => Promise<boolean>;

  clearSelectedMeeting: () => void;

  selectMeeting: (
    meeting: MeetingRequest,
  ) => void;
};

const sortMeetings = (
  meetings: MeetingRequest[],
) =>
  [...meetings].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  );

export const useMeetingStore =
  create<MeetingStore>((set) => ({
    myMeetings: [],
    founderMeetings: [],
    adminMeetings: [],

    selectedMeeting: null,

    isLoading: false,
    isRefreshing: false,
    isSubmitting: false,

    errorMessage: null,

    loadMyMeetings: async () => {
      set({
        isLoading: true,
        errorMessage: null,
      });

      try {
        const meetings =
          await meetingApi.getMyMeetings();

        set({
          myMeetings:
            sortMeetings(meetings),
          isLoading: false,
        });
      } catch (error) {
        const appError =
          toAppError(error);

        set({
          errorMessage:
            appError.message,
          isLoading: false,
        });
      }
    },

    loadFounderMeetings:
      async (startupId) => {
        set({
          isLoading: true,
          errorMessage: null,
        });

        try {
          const meetings =
            await meetingApi.getFounderMeetings(
              startupId,
            );

          set({
            founderMeetings:
              sortMeetings(meetings),
            isLoading: false,
          });
        } catch (error) {
          const appError =
            toAppError(error);

          set({
            errorMessage:
              appError.message,
            isLoading: false,
          });
        }
      },

    loadAdminMeetings:
      async () => {
        set({
          isLoading: true,
          errorMessage: null,
        });

        try {
          const meetings =
            await meetingApi.getAdminMeetings();

          set({
            adminMeetings:
              sortMeetings(meetings),
            isLoading: false,
          });
        } catch (error) {
          const appError =
            toAppError(error);

          set({
            errorMessage:
              appError.message,
            isLoading: false,
          });
        }
      },

    createMeeting:
      async (payload) => {
        set({
          isSubmitting: true,
          errorMessage: null,
        });

        try {
          const meeting =
            await meetingApi.createMeeting(
              payload,
            );

          set((state) => ({
            myMeetings:
              sortMeetings([
                meeting,
                ...state.myMeetings,
              ]),
            isSubmitting: false,
          }));

          useToastStore
            .getState()
            .show({
              type: "success",
              title:
                "Meeting Request Sent",
              message:
                "Founder will review your request.",
            });

          return true;
        } catch (error) {
          const appError =
            toAppError(error);

          set({
            errorMessage:
              appError.message,
            isSubmitting: false,
          });

          useToastStore
            .getState()
            .show({
              type: "error",
              title:
                "Meeting Request Failed",
              message:
                appError.message,
            });

          return false;
        }
      },

    updateMeetingStatus:
      async (
        id,
        status,
      ) => {
        try {
          const updated =
            await meetingApi.updateMeetingStatus(
              id,
              status,
            );

          set((state) => ({
            adminMeetings:
              state.adminMeetings.map(
                (item) =>
                  item.id === id
                    ? updated
                    : item,
              ),

            founderMeetings:
              state.founderMeetings.map(
                (item) =>
                  item.id === id
                    ? updated
                    : item,
              ),

            myMeetings:
              state.myMeetings.map(
                (item) =>
                  item.id === id
                    ? updated
                    : item,
              ),
          }));

          useToastStore
            .getState()
            .show({
              type: "success",
              title:
                "Status Updated",
            });

          return true;
        } catch (error) {
          const appError =
            toAppError(error);

          useToastStore
            .getState()
            .show({
              type: "error",
              title:
                "Update Failed",
              message:
                appError.message,
            });

          return false;
        }
      },

    clearSelectedMeeting:
      () =>
        set({
          selectedMeeting:
            null,
        }),

    selectMeeting:
      (meeting) =>
        set({
          selectedMeeting:
            meeting,
        }),
  }));