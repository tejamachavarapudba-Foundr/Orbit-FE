import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, TextInput, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Dropdown } from "@/components/ui/Dropdown";
import { FilterChip } from "@/components/ui/FilterChip";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { CategoryDropdown } from "@/modules/post/components/CategoryDropdown";
import { useProjects } from "@/modules/project/hooks";
import { meetingApi } from "@/modules/meeting/api";
import { useMeetingsStore } from "@/modules/meeting/store";
import { getDeviceTimezone } from "@/modules/meeting/hooks";
import { InviteMode, meetingPurposeOptions, ProposedSlot, SchedulingMode } from "@/modules/meeting/types";
import { PeoplePickerModal } from "@/modules/meeting/components/PeoplePickerModal";
import { iconSize } from "@/theme/designTokens";

type PersonOption = { id: string; fullName: string; headline: string };

const MAX_DATE_SLOTS = 3;

type Props = {
  onSuccess: () => void;
  initialStartupId?: string | undefined;
};

export const CreateMeetingForm = ({ onSuccess, initialStartupId }: Props) => {
  const colors = useThemeTokens();
  const { projects } = useProjects();
  const isLoading = useMeetingsStore((state) => state.isLoading);
  const createProposal = useMeetingsStore((state) => state.createProposal);

  const [purpose, setPurpose] = useState(meetingPurposeOptions[0]?.value ?? "");
  const [message, setMessage] = useState("");

  const [inviteMode, setInviteMode] = useState<InviteMode>(initialStartupId ? "startup" : "people");
  const [startupId, setStartupId] = useState(initialStartupId ?? "");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<PersonOption[]>([]);

  const [schedulingMode, setSchedulingMode] = useState<SchedulingMode>("date_push");
  const [openSlots, setOpenSlots] = useState<ProposedSlot[] | null>(null);
  const [loadingOpenSlots, setLoadingOpenSlots] = useState(false);
  const [selectedOpenSlot, setSelectedOpenSlot] = useState<ProposedSlot | null>(null);

  const [dateSlots, setDateSlots] = useState<ProposedSlot[]>([]);
  const [pickerFor, setPickerFor] = useState<{ index: number; mode: "date" | "time" } | null>(null);

  const selectedProject = useMemo(() => projects.find((p) => p.id === startupId) ?? null, [projects, startupId]);

  // For a startup invite there's no individual invitee to pick from a
  // people-search — the meeting is with the startup's founder, so their
  // published availability (via the project's ownerId) is what "Pick their
  // availability" should show, exactly like a single-person invite does.
  const singleInviteeId =
    inviteMode === "startup" ? (selectedProject?.ownerId ?? null) : selectedPeople.length === 1 ? (selectedPeople[0]?.id ?? null) : null;

  const canPickAvailability = Boolean(singleInviteeId) && Boolean(openSlots?.length);

  useEffect(() => {
    if (!singleInviteeId) {
      setOpenSlots(null);
      if (schedulingMode === "availability_pick") setSchedulingMode("date_push");
      return;
    }
    setLoadingOpenSlots(true);
    meetingApi
      .getOpenSlotsFor(singleInviteeId)
      .then((res) => setOpenSlots(res.slots))
      .finally(() => setLoadingOpenSlots(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleInviteeId]);

  const inviteeSummary = useMemo(() => {
    if (inviteMode === "startup") {
      return selectedProject ? selectedProject.name : "";
    }
    return selectedPeople.map((p) => p.fullName).join(", ");
  }, [inviteMode, selectedProject, selectedPeople]);

  const addDateSlot = () => {
    if (dateSlots.length >= MAX_DATE_SLOTS) return;
    setDateSlots((current) => [...current, { date: "", time: "" }]);
  };

  const removeDateSlot = (index: number) => {
    setDateSlots((current) => current.filter((_, i) => i !== index));
  };

  const updateDateSlot = (index: number, patch: Partial<ProposedSlot>) => {
    setDateSlots((current) => current.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  };

  const onPickerChange = (event: DateTimePickerEvent, value?: Date) => {
    const target = pickerFor;
    setPickerFor(null);
    if (event.type === "dismissed" || !value || !target) return;

    if (target.mode === "date") {
      const iso = value.toISOString().slice(0, 10);
      updateDateSlot(target.index, { date: iso });
    } else {
      const hh = String(value.getHours()).padStart(2, "0");
      const mm = String(value.getMinutes()).padStart(2, "0");
      updateDateSlot(target.index, { time: `${hh}:${mm}` });
    }
  };

  const canSubmit =
    Boolean(purpose) &&
    (inviteMode === "startup" ? Boolean(startupId) : selectedPeople.length > 0) &&
    (schedulingMode === "availability_pick"
      ? Boolean(selectedOpenSlot)
      : dateSlots.length > 0 && dateSlots.every((slot) => slot.date && slot.time));

  const handleSubmit = async () => {
    const success = await createProposal({
      inviteMode,
      targetStartupId: inviteMode === "startup" ? startupId : undefined,
      inviteeUserIds: inviteMode === "people" ? selectedPeople.map((p) => p.id) : undefined,
      purpose,
      message: message.trim() || undefined,
      schedulingMode,
      selectedSlot: schedulingMode === "availability_pick" ? selectedOpenSlot ?? undefined : undefined,
      proposedSlots: schedulingMode === "date_push" ? dateSlots : undefined,
      timezone: getDeviceTimezone()
    });
    if (success) onSuccess();
  };

  return (
    <View className="gap-4">
      <View>
        <AppText weight="semibold" className="mb-2">
          Purpose
        </AppText>
        <CategoryDropdown value={purpose} options={meetingPurposeOptions} onChange={setPurpose} />
      </View>

      <View>
        <AppText weight="semibold" className="mb-2">
          Message
        </AppText>
        <TextInput
          multiline
          numberOfLines={4}
          value={message}
          onChangeText={setMessage}
          placeholder="Briefly describe the agenda..."
          placeholderTextColor={colors.muted}
          className="min-h-[96px] rounded-lg border border-input bg-background p-4 text-text"
          textAlignVertical="top"
        />
      </View>

      <View>
        <AppText weight="semibold" className="mb-2">
          Invite
        </AppText>
        <View className="flex-row gap-2">
          <FilterChip
            label="Startup"
            isActive={inviteMode === "startup"}
            activeTone="primary"
            onPress={() => setInviteMode("startup")}
          />
          <FilterChip
            label="People"
            isActive={inviteMode === "people"}
            activeTone="primary"
            onPress={() => setInviteMode("people")}
          />
        </View>

        {inviteMode === "startup" ? (
          <Dropdown
            value={startupId}
            options={projects.map((project) => ({ label: project.name, value: project.id }))}
            onChange={setStartupId}
            placeholder="Select a startup"
            className="mt-3 w-full"
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => setPickerVisible(true)}
            className="mt-3 min-h-11 flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-2.5"
          >
            {inviteeSummary ? (
              <AppText size="sm" numberOfLines={1} className="mr-2 flex-1">
                {inviteeSummary}
              </AppText>
            ) : (
              <AppText size="sm" numberOfLines={1} className="mr-2 flex-1" tone="muted">
                Select people
              </AppText>
            )}
            <Feather name="user-plus" size={iconSize.md} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <View>
        <AppText weight="semibold" className="mb-2">
          Scheduling
        </AppText>
        <View className="flex-row gap-2">
          <FilterChip
            label="Pick their availability"
            isActive={schedulingMode === "availability_pick"}
            activeTone="primary"
            onPress={() => canPickAvailability && setSchedulingMode("availability_pick")}
          />
          <FilterChip
            label="Propose dates"
            isActive={schedulingMode === "date_push"}
            activeTone="primary"
            onPress={() => setSchedulingMode("date_push")}
          />
        </View>
        {!canPickAvailability && singleInviteeId && !loadingOpenSlots ? (
          <AppText tone="muted" size="xs" className="mt-2">
            No availability set for this person — propose dates instead.
          </AppText>
        ) : null}
        {inviteMode === "people" && selectedPeople.length > 1 ? (
          <AppText tone="muted" size="xs" className="mt-2">
            "Pick their availability" only works for a single invitee.
          </AppText>
        ) : null}
      </View>

      {schedulingMode === "availability_pick" ? (
        <View className="gap-2">
          {(openSlots ?? []).slice(0, 20).map((slot) => {
            const isSelected = selectedOpenSlot?.date === slot.date && selectedOpenSlot?.time === slot.time;
            return (
              <Pressable
                key={`${slot.date}-${slot.time}`}
                accessibilityRole="button"
                onPress={() => setSelectedOpenSlot(slot)}
                className={`flex-row items-center justify-between rounded-md border px-3 py-2.5 ${
                  isSelected ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <AppText size="sm">
                  {slot.date} &middot; {slot.time}
                </AppText>
                {isSelected ? <Feather name="check" size={iconSize.md} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View className="gap-3">
          {dateSlots.map((slot, index) => (
            <View key={index} className="flex-row items-center gap-2">
              <Pressable
                accessibilityRole="button"
                onPress={() => setPickerFor({ index, mode: "date" })}
                className="h-11 flex-1 justify-center rounded-md border border-input bg-background px-3"
              >
                <AppText size="sm">{slot.date || "Select date"}</AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPickerFor({ index, mode: "time" })}
                className="h-11 flex-1 justify-center rounded-md border border-input bg-background px-3"
              >
                <AppText size="sm">{slot.time || "Select time"}</AppText>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => removeDateSlot(index)} hitSlop={8}>
                <Feather name="x" size={iconSize.md} color={colors.muted} />
              </Pressable>
            </View>
          ))}
          {dateSlots.length < MAX_DATE_SLOTS ? (
            <Pressable accessibilityRole="button" onPress={addDateSlot} className="flex-row items-center gap-2">
              <Feather name="plus" size={iconSize.md} color={colors.primary} />
              <AppText tone="primary" size="sm" weight="medium">
                Add a candidate time
              </AppText>
            </Pressable>
          ) : null}

          {pickerFor?.mode === "date" ? (
            <DateTimePicker
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              value={new Date()}
              onChange={onPickerChange}
            />
          ) : pickerFor?.mode === "time" ? (
            <DateTimePicker
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              value={new Date()}
              onChange={onPickerChange}
            />
          ) : null}
        </View>
      )}

      <AppButton
        label={schedulingMode === "availability_pick" ? "Book meeting" : "Send meeting request"}
        loading={isLoading}
        disabled={!canSubmit || isLoading}
        onPress={() => void handleSubmit()}
        className="mt-2"
      />

      <PeoplePickerModal
        visible={pickerVisible}
        selectedIds={selectedPeople.map((p) => p.id)}
        onClose={() => setPickerVisible(false)}
        onDone={(_ids, people) => {
          setSelectedPeople(people);
          setPickerVisible(false);
        }}
      />
    </View>
  );
};
