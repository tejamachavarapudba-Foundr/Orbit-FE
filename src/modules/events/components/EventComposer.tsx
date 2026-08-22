import { useState } from "react";
import { Pressable, Switch, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { EventLocationPicker } from "@/modules/events/components/EventLocationPicker";
import { useEvents } from "@/modules/events/hooks";
import { LocationValue } from "@/services/location/geocoding";
import { useCommunities } from "@/modules/community/hooks";
import { PeoplePickerModal } from "@/modules/meeting/components/PeoplePickerModal";
import { iconSize } from "@/theme/designTokens";

const defaultStartsAt = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
};

const defaultEndsAt = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(21, 0, 0, 0);
  return d.toISOString();
};

const toIsoOrNull = (value: string) => {
  const parsed = new Date(value.trim());
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const emptyLocation = (): LocationValue => ({
  address: "",
  latitude: null,
  longitude: null
});

export const EventComposer = () => {
  const { createEvent, isCreating } = useEvents();
  const { communities } = useCommunities();
  const colors = useThemeTokens();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationValue, setLocationValue] = useState<LocationValue>(emptyLocation);
  const [startsAt, setStartsAt] = useState(defaultStartsAt);
  const [endsAt, setEndsAt] = useState(defaultEndsAt);
  const [isPrivate, setIsPrivate] = useState(false);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [inviteeIds, setInviteeIds] = useState<string[]>([]);
  const [inviteeNames, setInviteeNames] = useState<string[]>([]);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const hasCoordinates = locationValue.latitude != null && locationValue.longitude != null;
  const canSubmit =
    title.trim() &&
    description.trim() &&
    locationValue.address.trim() &&
    hasCoordinates &&
    toIsoOrNull(startsAt) &&
    toIsoOrNull(endsAt);

  const reset = () => {
    setTitle("");
    setDescription("");
    setLocationValue(emptyLocation());
    setStartsAt(defaultStartsAt());
    setEndsAt(defaultEndsAt());
    setIsPrivate(false);
    setCommunityId(null);
    setInviteeIds([]);
    setInviteeNames([]);
    setIsExpanded(false);
  };

  const submit = async () => {
    const startsIso = toIsoOrNull(startsAt);
    const endsIso = toIsoOrNull(endsAt);

    if (!startsIso || !endsIso || !hasCoordinates) {
      return;
    }

    const success = await createEvent({
      title: title.trim(),
      description: description.trim(),
      location: locationValue.address.trim(),
      startsAt: startsIso,
      endsAt: endsIso,
      latitude: locationValue.latitude as number,
      longitude: locationValue.longitude as number,
      isPrivate,
      ...(isPrivate && communityId ? { communityId } : {}),
      ...(isPrivate && inviteeIds.length ? { inviteeIds } : {})
    });

    if (success) {
      reset();
    }
  };

  if (!isExpanded) {
    return (
      <View className="rounded-md border border-border bg-surface p-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <AppText weight="bold">Host an event</AppText>
            <AppText tone="muted" size="sm" className="mt-1">
              A space where anyone can host.
            </AppText>
          </View>
          <AppButton label="New event" onPress={() => setIsExpanded(true)} className="h-10 px-4" />
        </View>
      </View>
    );
  }

  return (
    <View className="rounded-md border border-border bg-surface p-4">
      <AppText weight="bold" size="lg">
        New event
      </AppText>
      <View className="mt-4 gap-3">
        <AppTextInput label="Title" value={title} onChangeText={setTitle} />
        <AppTextInput label="Description" value={description} onChangeText={setDescription} multiline />
        <EventLocationPicker value={locationValue} onChange={setLocationValue} />
        <AppTextInput
          label="Starts at"
          value={startsAt}
          onChangeText={setStartsAt}
          autoCapitalize="none"
          placeholder="ISO date, e.g. 2026-07-01T18:00:00.000Z"
        />
        <AppTextInput
          label="Ends at"
          value={endsAt}
          onChangeText={setEndsAt}
          autoCapitalize="none"
          placeholder="ISO date, e.g. 2026-07-01T21:00:00.000Z"
        />

        <View className="flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-3">
          <View className="min-w-0 flex-1 pr-3">
            <AppText weight="medium">Private event</AppText>
            <AppText tone="muted" size="xs" className="mt-0.5">
              Only invited people or a community's members can see and join, like a founders celebration.
            </AppText>
          </View>
          <Switch value={isPrivate} onValueChange={setIsPrivate} />
        </View>

        {isPrivate ? (
          <>
            {communities.length ? (
              <View className="gap-2">
                <AppText size="sm" weight="medium">
                  Invite a community (optional)
                </AppText>
                <View className="flex-row flex-wrap gap-2">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setCommunityId(null)}
                    className={`rounded-full border px-3 py-2 ${
                      communityId === null ? "border-primary bg-primary/10" : "border-input"
                    }`}
                  >
                    <AppText size="sm" tone={communityId === null ? "primary" : "default"}>
                      None
                    </AppText>
                  </Pressable>
                  {communities.map((community) => (
                    <Pressable
                      key={community.id}
                      accessibilityRole="button"
                      onPress={() => setCommunityId(community.id)}
                      className={`rounded-full border px-3 py-2 ${
                        communityId === community.id ? "border-primary bg-primary/10" : "border-input"
                      }`}
                    >
                      <AppText size="sm" tone={communityId === community.id ? "primary" : "default"}>
                        {community.name}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={() => setIsPickerVisible(true)}
              className="flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-3"
            >
              <AppText size="sm" tone={inviteeNames.length ? "default" : "muted"}>
                {inviteeNames.length ? `${inviteeNames.length} people invited` : "Invite specific people (optional)"}
              </AppText>
              <Feather name="user-plus" size={iconSize.md} color={colors.muted} />
            </Pressable>
          </>
        ) : null}
      </View>
      <View className="mt-4 flex-row gap-3">
        <AppButton label="Cancel" variant="outline" onPress={() => setIsExpanded(false)} className="flex-1" />
        <AppButton label="Create" loading={isCreating} disabled={!canSubmit} onPress={() => void submit()} className="flex-1" />
      </View>

      <PeoplePickerModal
        visible={isPickerVisible}
        selectedIds={inviteeIds}
        onClose={() => setIsPickerVisible(false)}
        onDone={(ids, people) => {
          setInviteeIds(ids);
          setInviteeNames(people.map((p) => p.fullName));
          setIsPickerVisible(false);
        }}
      />
    </View>
  );
};
