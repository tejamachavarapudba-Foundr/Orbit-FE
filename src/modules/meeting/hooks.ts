import {
    useCallback,
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import { useMeetingStore } from "@/modules/meeting/store";
  
  import {
    MeetingPurpose,
    MeetingRequestPayload,
    MeetingStatus,
  } from "@/modules/meeting/types";
  
 
  
  export const meetingPurposeOptions = [
    {
      label: "Investment Discussion",
      value: "Investment Discussion",
    },
    {
      label: "Product Demo",
      value: "Product Demo",
    },
    {
      label: "Partnership",
      value: "Partnership",
    },
    {
      label: "Technical Discussion",
      value: "Technical Discussion",
    },
    {
      label: "Mentorship",
      value: "Mentorship",
    },
    {
      label: "General Discussion",
      value: "General Discussion",
    },
    {
      label: "Other",
      value: "Other",
    },
  ];
  
  const emptyPayload: MeetingRequestPayload = {
    startupId: "",
  
    purpose: "Investment Discussion",
  
    preferredDate1: "",
    preferredTime1: "",
  
    preferredDate2: "",
    preferredTime2: "",
  
    expectedInvestment: "",
  
    message: "",
  };
  
  export const useMeetingForm = (
    startupId: string,
  ) => {
    const createMeeting =
      useMeetingStore(
        (state) => state.createMeeting,
      );
  
       
      // console.log("Admin meetings:", meetings);
      
    const isSubmitting =
      useMeetingStore(
        (state) => state.isSubmitting,
      );
  
    const [values, setValues] =
      useState({
        ...emptyPayload,
        startupId,
      });
  
    useEffect(() => {
      setValues((current: typeof values) => ({
        ...current,
        startupId,
      }));
    }, [startupId]);
    
    // useEffect(() => {
    //   console.log("Loading admin meetings...");
    //   void loadMeetings();
    // }, []);
    const setField = 
      useCallback(
        <
          Key extends keyof typeof values,
        >(
          key: Key,
          value: (typeof values)[Key],
        ) => {
          setValues((current: typeof values) => ({
            ...current,
            [key]: value,
          }));
        },
        [],
      );
  
    const submit = 
      useCallback(async () => {
        if (
          !values.purpose.trim() ||
          !values.preferredDate1 ||
          !values.preferredTime1
        ) {
          return false;
        }
  
        const success =
          await createMeeting({
            ...values,
          });
  
        if (success) {
          setValues({
            ...emptyPayload,
            startupId,
          });
        }
  
        return success;
      }, [
        values,
        startupId,
        createMeeting,
      ]);
  
    return {
      values,
  
      setField,
  
      submit,
  
      isSubmitting,
  
      //canSubmit:
        // Boolean(
        //   values.purpose &&
        //     values.preferredDate1 &&
        //     values.preferredTime1,
        // ),
    };
  };
  
  export const useInvestorMeetings =
    () => {
      const meetings =
        useMeetingStore(
          (state) => state.myMeetings,
        );
  
      const loadMeetings =
        useMeetingStore(
          (state) =>
            state.loadMyMeetings,
        );
  
      const isLoading =
        useMeetingStore(
          (state) => state.isLoading,
        );
  
      const errorMessage =
        useMeetingStore(
          (state) =>
            state.errorMessage,
        );
  
      useEffect(() => {
        void loadMeetings();
      }, []);
  
      return {
        meetings,
  
        isLoading,
  
        errorMessage,
  
        refresh: loadMeetings,
      };
    };
  
  export const useFounderMeetings =
    (startupId: string) => {
      const meetings =
        useMeetingStore(
          (state) =>
            state.founderMeetings,
        );
  
      const loadMeetings =
        useMeetingStore(
          (state) =>
            state.loadFounderMeetings,
        );
  
      const isLoading =
        useMeetingStore(
          (state) => state.isLoading,
        );
  
      useEffect(() => {
        if (startupId) {
          void loadMeetings(
            startupId,
          );
        }
      }, [startupId]);
  
      return {
        meetings,
  
        isLoading,
  
        refresh: () =>
          loadMeetings(startupId),
      };
    };
  
  export const useAdminMeetings =
    () => {
      const meetings =
        useMeetingStore(
          (state) =>
            state.adminMeetings,
        );
  
      const loadMeetings =
        useMeetingStore(
          (state) =>
            state.loadAdminMeetings,
        );
  
      const updateStatus =
        useMeetingStore(
          (state) =>
            state.updateMeetingStatus,
        );
  
      const isLoading =
        useMeetingStore(
          (state) => state.isLoading,
        );
  
      useEffect(() => {
        void loadMeetings();
      }, []);
  
      return {
        meetings,
  
        isLoading,
  
        refresh: loadMeetings,
  
        updateStatus,
      };
    };
  
  export const useMeetingDetail =
    () => {
      const selectedMeeting =
        useMeetingStore(
          (state) =>
            state.selectedMeeting,
        );
  
      const selectMeeting =
        useMeetingStore(
          (state) =>
            state.selectMeeting,
        );
  
      const clearSelectedMeeting =
        useMeetingStore(
          (state) =>
            state.clearSelectedMeeting,
        );
  
      return {
        selectedMeeting,
  
        selectMeeting,
  
        clearSelectedMeeting,
      };
    };
  
  export const meetingStatusOptions =
    [
      {
        label: "Pending",
        value: "pending",
      },
      {
        label:
          "Founder Contacted",
        value:
          "founder_contacted",
      },
      {
        label: "Approved",
        value: "approved",
      },
      {
        label: "Rejected",
        value: "rejected",
      },
    ];
  
  export const useMeetingStatistics =
    () => {
      const meetings =
        useMeetingStore(
          (state) =>
            state.myMeetings,
        );
  
      return useMemo(() => {
        return {
          total:
            meetings.length,
  
          pending:
            meetings.filter(
              (m) =>
                m.status ===
                "pending",
            ).length,
  
          approved:
            meetings.filter(
              (m) =>
                m.status ===
                "approved",
            ).length,
  
          rejected:
            meetings.filter(
              (m) =>
                m.status ===
                "rejected",
            ).length,
  
          contacted:
            meetings.filter(
              (m) =>
                m.status ===
                "founder_contacted",
            ).length,
        };
      }, [meetings]);
    };