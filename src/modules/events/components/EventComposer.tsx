import { useState } from "react";
import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { EventLocationPicker } from "@/modules/events/components/EventLocationPicker";
import { useEvents } from "@/modules/events/hooks";
import { LocationValue } from "@/services/location/geocoding";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationValue, setLocationValue] = useState<LocationValue>(emptyLocation);
  const [startsAt, setStartsAt] = useState(defaultStartsAt);
  const [endsAt, setEndsAt] = useState(defaultEndsAt);

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
      longitude: locationValue.longitude as number
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
              Founders, co-founders and investors can create meetups.
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
      </View>
      <View className="mt-4 flex-row gap-3">
        <AppButton label="Cancel" variant="outline" onPress={() => setIsExpanded(false)} className="flex-1" />
        <AppButton label="Create" loading={isCreating} disabled={!canSubmit} onPress={() => void submit()} className="flex-1" />
      </View>
    </View>
  );
};
