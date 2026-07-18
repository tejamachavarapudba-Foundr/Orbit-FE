import { LayoutChangeEvent, Platform, Pressable, TextInput, View } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";

import {
  meetingPurposeOptions,
  useMeetingForm,
} from "@/modules/meeting/hooks";

import { CategoryDropdown } from "@/modules/post/components/CategoryDropdown";

// #region agent log
const DEBUG_LOG_HOST = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1";
const debugLog = (
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
) => {
  fetch(`http://${DEBUG_LOG_HOST}:7427/ingest/b69baca5-7169-4c15-b121-a6217c30cb9c`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "1aa2f1",
    },
    body: JSON.stringify({
      sessionId: "1aa2f1",
      runId: "pre-fix",
      hypothesisId,
      location,
      message,
      data: { platform: Platform.OS, ...data },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
};
// #endregion

type Props = {
  startupId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
  onStateChange?: (state: {
    canSubmit: boolean;
    isSubmitting: boolean;
    submit: () => void;
  }) => void;
};

export const MeetingRequestForm = ({
  startupId,
  onSuccess,
  onCancel,
  showActions = true,
  onStateChange,
}: Props) => {
  const colors = useThemeTokens();

  const [showDate1, setShowDate1] = useState(false);
  const [showDate2, setShowDate2] = useState(false);

  const [showTime1, setShowTime1] = useState(false);
  const [showTime2, setShowTime2] = useState(false);

  const {
    values,
    setField,
    submit,
    isSubmitting,
    canSubmit,
  } = useMeetingForm(startupId);

  // #region agent log
  const renderCountRef = useRef(0);
  const prevHandleSubmitRef = useRef<(() => Promise<void>) | null>(null);
  const prevOnStateChangeRef = useRef(onStateChange);
  const prevSubmitRef = useRef(submit);
  const prevOnSuccessRef = useRef(onSuccess);
  const prevCanSubmitRef = useRef(canSubmit);
  const prevIsSubmittingRef = useRef(isSubmitting);
  renderCountRef.current += 1;
  debugLog("E", "MeetingRequestForm.tsx:render", "component render", {
    renderCount: renderCountRef.current,
    canSubmit,
    isSubmitting,
  });
  // #endregion

  const handleSubmit = useCallback(async () => {
    const success = await submit();

    if (success) {
      onSuccess?.();
    }
  }, [submit, onSuccess]);

  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  const stableSubmitRef = useRef(() => {
    void handleSubmitRef.current();
  });

  useEffect(() => {
    const changedDeps: string[] = [];
    if (prevCanSubmitRef.current !== canSubmit) changedDeps.push("canSubmit");
    if (prevIsSubmittingRef.current !== isSubmitting) changedDeps.push("isSubmitting");
    if (prevHandleSubmitRef.current !== handleSubmit) changedDeps.push("handleSubmit");
    if (prevOnStateChangeRef.current !== onStateChange) changedDeps.push("onStateChange");
    if (prevOnSuccessRef.current !== onSuccess) changedDeps.push("onSuccess");
    if (prevSubmitRef.current !== submit) changedDeps.push("submit");

    // #region agent log
    debugLog("A", "MeetingRequestForm.tsx:onStateChangeEffect", "effect fired", {
      renderCount: renderCountRef.current,
      changedDeps,
      canSubmit,
      isSubmitting,
      hasOnStateChange: Boolean(onStateChange),
      runId: "post-fix",
    });
    // #endregion

    prevCanSubmitRef.current = canSubmit;
    prevIsSubmittingRef.current = isSubmitting;
    prevHandleSubmitRef.current = handleSubmit;
    prevOnStateChangeRef.current = onStateChange;
    prevOnSuccessRef.current = onSuccess;
    prevSubmitRef.current = submit;

    onStateChange?.({
      canSubmit,
      isSubmitting,
      submit: stableSubmitRef.current,
    });
  }, [canSubmit, isSubmitting, onStateChange]);

  const logFormLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    // #region agent log
    debugLog("B", "MeetingRequestForm.tsx:onLayout", "form content measured", {
      contentHeight: height,
      showActions,
    });
    // #endregion
  };

  const logActionsLayout = (event: LayoutChangeEvent) => {
    const { height, y } = event.nativeEvent.layout;
    // #region agent log
    debugLog("B", "MeetingRequestForm.tsx:actionsLayout", "action buttons measured", {
      actionsHeight: height,
      actionsY: y,
    });
    // #endregion
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const handleDateChange = (
    picker: "date1" | "date2",
    event: DateTimePickerEvent,
    date?: Date,
  ) => {
    // #region agent log
    debugLog("C", "MeetingRequestForm.tsx:handleDateChange", "date picker event", {
      picker,
      eventType: event.type,
      hasDate: Boolean(date),
    });
    // #endregion

    if (Platform.OS === "android") {
      if (picker === "date1") setShowDate1(false);
      if (picker === "date2") setShowDate2(false);
    }

    if (event.type === "dismissed") {
      if (picker === "date1") setShowDate1(false);
      if (picker === "date2") setShowDate2(false);
      return;
    }

    if (date) {
      const formatted = formatDate(date);
      if (picker === "date1") setField("preferredDate1", formatted);
      if (picker === "date2") setField("preferredDate2", formatted);
    }
  };

  const handleTimeChange = (
    picker: "time1" | "time2",
    event: DateTimePickerEvent,
    date?: Date,
  ) => {
    // #region agent log
    debugLog("C", "MeetingRequestForm.tsx:handleTimeChange", "time picker event", {
      picker,
      eventType: event.type,
      hasDate: Boolean(date),
    });
    // #endregion

    if (Platform.OS === "android") {
      if (picker === "time1") setShowTime1(false);
      if (picker === "time2") setShowTime2(false);
    }

    if (event.type === "dismissed") {
      if (picker === "time1") setShowTime1(false);
      if (picker === "time2") setShowTime2(false);
      return;
    }

    if (date) {
      const formatted = formatTime(date);
      if (picker === "time1") setField("preferredTime1", formatted);
      if (picker === "time2") setField("preferredTime2", formatted);
    }
  };

  const openDatePicker = (picker: "date1" | "date2") => {
    // #region agent log
    debugLog("C", "MeetingRequestForm.tsx:openDatePicker", "date picker opened", { picker });
    // #endregion
    if (picker === "date1") setShowDate1(true);
    if (picker === "date2") setShowDate2(true);
  };

  const openTimePicker = (picker: "time1" | "time2") => {
    // #region agent log
    debugLog("C", "MeetingRequestForm.tsx:openTimePicker", "time picker opened", { picker });
    // #endregion
    if (picker === "time1") setShowTime1(true);
    if (picker === "time2") setShowTime2(true);
  };

  return (
    <View className="gap-4" onLayout={logFormLayout}>

      {/* Purpose */}

      <View>
        <AppText
          weight="semibold"
          className="mb-2"
        >
          Meeting Purpose
        </AppText>

        <CategoryDropdown
          value={values.purpose}
          options={meetingPurposeOptions}
          onChange={(value) =>
            setField("purpose", value)
          }
        />
      </View>

      {/* Preferred Date */}

      <View>
        <AppText
          weight="semibold"
          className="mb-2"
        >
          Preferred Date
        </AppText>

        <Pressable
          onPress={() => openDatePicker("date1")}
          className="h-12 justify-center rounded-lg border border-input bg-background px-4"
        >
          <AppText>
            {values.preferredDate1 || "Select Date"}
          </AppText>
        </Pressable>

        {showDate1 && (
          <DateTimePicker
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date()}
            value={
              values.preferredDate1
                ? new Date(values.preferredDate1)
                : new Date()
            }
            onChange={(event, date) => handleDateChange("date1", event, date)}
          />
        )}
      </View>

      {/* Preferred Time */}

      <View>
        <AppText
          weight="semibold"
          className="mb-2"
        >
          Preferred Time
        </AppText>

        <Pressable
          onPress={() => openTimePicker("time1")}
          className="h-12 justify-center rounded-lg border border-input bg-background px-4"
        >
          <AppText>
            {values.preferredTime1 || "Select Time"}
          </AppText>
        </Pressable>

        {showTime1 && (
          <DateTimePicker
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            value={new Date()}
            onChange={(event, date) => handleTimeChange("time1", event, date)}
          />
        )}
      </View>

      {/* Alternate Date */}

      <View>
        <AppText
          weight="semibold"
          className="mb-2"
        >
          Alternate Date
        </AppText>

        <Pressable
          onPress={() => openDatePicker("date2")}
          className="h-12 justify-center rounded-lg border border-input bg-background px-4"
        >
          <AppText>
            {values.preferredDate2 || "Select Date"}
          </AppText>
        </Pressable>

        {showDate2 && (
          <DateTimePicker
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date()}
            value={new Date()}
            onChange={(event, date) => handleDateChange("date2", event, date)}
          />
        )}
      </View>

      {/* Alternate Time */}

      <View>
        <AppText
          weight="semibold"
          className="mb-2"
        >
          Alternate Time
        </AppText>

        <Pressable
          onPress={() => openTimePicker("time2")}
          className="h-12 justify-center rounded-lg border border-input bg-background px-4"
        >
          <AppText>
            {values.preferredTime2 || "Select Time"}
          </AppText>
        </Pressable>

        {showTime2 && (
          <DateTimePicker
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            value={new Date()}
            onChange={(event, date) => handleTimeChange("time2", event, date)}
          />
        )}
      </View>

      {/* Expected Investment */}

      <View>
        <AppText
          weight="semibold"
          className="mb-2"
        >
          Expected Investment
        </AppText>

        <TextInput
          value={values.expectedInvestment}
          onChangeText={(text) =>
            setField(
              "expectedInvestment",
              text,
            )
          }
          placeholder="₹ 25,00,000"
          keyboardType="number-pad"
          placeholderTextColor={colors.muted}
          className="h-12 rounded-lg border border-input bg-background px-4 text-text"
        />
      </View>

      {/* Message */}

      <View>
        <AppText
          weight="semibold"
          className="mb-2"
        >
          Message
        </AppText>

        <TextInput
          multiline
          numberOfLines={5}
          value={values.message}
          onChangeText={(text) =>
            setField(
              "message",
              text,
            )
          }
          placeholder="Briefly describe why you'd like to meet..."
          placeholderTextColor={colors.muted}
          className="min-h-[120px] rounded-lg border border-input bg-background p-4 text-text"
          textAlignVertical="top"
        />
      </View>

      {showActions ? (
        <View
          className="mt-6 flex-row gap-3"
          onLayout={logActionsLayout}
        >
          <AppButton
            label="Cancel"
            variant="outline"
            className="flex-1"
            onPress={onCancel}
          />

          <AppButton
            label="Send Request"
            className="flex-1"
            loading={isSubmitting}
            disabled={!canSubmit}
            onPress={() => void handleSubmit()}
          />
        </View>
      ) : null}

    </View>
  );
};
