import { Platform, Pressable, TextInput, View } from "react-native";
import { useCallback, useEffect, useState } from "react";

import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Dropdown } from "@/components/ui/Dropdown";
import { useThemeTokens } from "@/hooks/useThemeTokens";

import { meetingPurposeOptions, useMeetingForm } from "@/modules/meeting/hooks";
import { useProjects } from "@/modules/project/hooks";

import { CategoryDropdown } from "@/modules/post/components/CategoryDropdown";

type Props = {
  startupId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
  onStateChange?: (state: { canSubmit: boolean; isSubmitting: boolean; submit: () => void }) => void;
};

export const MeetingRequestForm = ({ startupId, onSuccess, onCancel, showActions = true, onStateChange }: Props) => {
  const colors = useThemeTokens();
  const needsStartupPicker = !startupId;
  const { projects } = useProjects();

  const [showDate1, setShowDate1] = useState(false);
  const [showDate2, setShowDate2] = useState(false);
  const [showTime1, setShowTime1] = useState(false);
  const [showTime2, setShowTime2] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState("");

  const { values, setField, submit, isSubmitting, canSubmit } = useMeetingForm(
    needsStartupPicker ? selectedStartupId : startupId
  );

  const effectiveCanSubmit = canSubmit && (!needsStartupPicker || Boolean(selectedStartupId));

  const handleSubmit = useCallback(async () => {
    const success = await submit();
    if (success) {
      onSuccess?.();
    }
  }, [submit, onSuccess]);

  useEffect(() => {
    onStateChange?.({
      canSubmit: effectiveCanSubmit,
      isSubmitting,
      submit: () => void handleSubmit()
    });
  }, [effectiveCanSubmit, isSubmitting, handleSubmit, onStateChange]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const handleDateChange = (picker: "date1" | "date2", event: DateTimePickerEvent, date?: Date) => {
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

  const handleTimeChange = (picker: "time1" | "time2", event: DateTimePickerEvent, date?: Date) => {
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
    if (picker === "date1") setShowDate1(true);
    if (picker === "date2") setShowDate2(true);
  };

  const openTimePicker = (picker: "time1" | "time2") => {
    if (picker === "time1") setShowTime1(true);
    if (picker === "time2") setShowTime2(true);
  };

  return (
    <View className="gap-4">
      {needsStartupPicker ? (
        <View>
          <AppText weight="semibold" className="mb-2">
            Startup
          </AppText>
          <Dropdown
            value={selectedStartupId}
            options={projects.map((project) => ({ label: project.name, value: project.id }))}
            onChange={setSelectedStartupId}
            placeholder="Select a startup"
          />
        </View>
      ) : null}

      <View>
        <AppText weight="semibold" className="mb-2">
          Meeting Purpose
        </AppText>
        <CategoryDropdown value={values.purpose} options={meetingPurposeOptions} onChange={(value) => setField("purpose", value)} />
      </View>

      <View>
        <AppText weight="semibold" className="mb-2">
          Preferred Date
        </AppText>
        <Pressable onPress={() => openDatePicker("date1")} className="h-12 justify-center rounded-lg border border-input bg-background px-4">
          <AppText>{values.preferredDate1 || "Select Date"}</AppText>
        </Pressable>
        {showDate1 && (
          <DateTimePicker
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date()}
            value={values.preferredDate1 ? new Date(values.preferredDate1) : new Date()}
            onChange={(event, date) => handleDateChange("date1", event, date)}
          />
        )}
      </View>

      <View>
        <AppText weight="semibold" className="mb-2">
          Preferred Time
        </AppText>
        <Pressable onPress={() => openTimePicker("time1")} className="h-12 justify-center rounded-lg border border-input bg-background px-4">
          <AppText>{values.preferredTime1 || "Select Time"}</AppText>
        </Pressable>
        {showTime1 && (
          <DateTimePicker mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} value={new Date()} onChange={(event, date) => handleTimeChange("time1", event, date)} />
        )}
      </View>

      <View>
        <AppText weight="semibold" className="mb-2">
          Alternate Date
        </AppText>
        <Pressable onPress={() => openDatePicker("date2")} className="h-12 justify-center rounded-lg border border-input bg-background px-4">
          <AppText>{values.preferredDate2 || "Select Date"}</AppText>
        </Pressable>
        {showDate2 && (
          <DateTimePicker mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} minimumDate={new Date()} value={new Date()} onChange={(event, date) => handleDateChange("date2", event, date)} />
        )}
      </View>

      <View>
        <AppText weight="semibold" className="mb-2">
          Alternate Time
        </AppText>
        <Pressable onPress={() => openTimePicker("time2")} className="h-12 justify-center rounded-lg border border-input bg-background px-4">
          <AppText>{values.preferredTime2 || "Select Time"}</AppText>
        </Pressable>
        {showTime2 && (
          <DateTimePicker mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} value={new Date()} onChange={(event, date) => handleTimeChange("time2", event, date)} />
        )}
      </View>

      <View>
        <AppText weight="semibold" className="mb-2">
          Expected Investment
        </AppText>
        <TextInput
          value={values.expectedInvestment}
          onChangeText={(text) => setField("expectedInvestment", text)}
          placeholder="₹ 25,00,000"
          keyboardType="number-pad"
          placeholderTextColor={colors.muted}
          className="h-12 rounded-lg border border-input bg-background px-4 text-text"
        />
      </View>

      <View>
        <AppText weight="semibold" className="mb-2">
          Message
        </AppText>
        <TextInput
          multiline
          numberOfLines={5}
          value={values.message}
          onChangeText={(text) => setField("message", text)}
          placeholder="Briefly describe why you'd like to meet..."
          placeholderTextColor={colors.muted}
          className="min-h-[120px] rounded-lg border border-input bg-background p-4 text-text"
          textAlignVertical="top"
        />
      </View>

      {showActions ? (
        <View className="mt-6 flex-row gap-3">
          <AppButton label="Cancel" variant="outline" className="flex-1" onPress={onCancel} />
          <AppButton
            label="Send Request"
            className="flex-1"
            loading={isSubmitting}
            disabled={!effectiveCanSubmit}
            onPress={() => void handleSubmit()}
          />
        </View>
      ) : null}
    </View>
  );
};
