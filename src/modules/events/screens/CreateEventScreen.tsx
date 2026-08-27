import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { EventLocationPicker } from "@/modules/events/components/EventLocationPicker";
import { useEvents } from "@/modules/events/hooks";
import { useCommunities } from "@/modules/community/hooks";
import { LocationValue } from "@/services/location/geocoding";
import { iconSize } from "@/theme/designTokens";
import { MainStackParamList } from "@/app/navigation/types";

const defaultStartsAt = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(18, 0, 0, 0);
  return d;
};

const defaultEndsAt = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(21, 0, 0, 0);
  return d;
};

const emptyLocation = (): LocationValue => ({
  address: "",
  latitude: null,
  longitude: null
});

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);

const formatTime = (date: Date) => {
  const hours24 = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
};

type PickerTarget = { field: "starts" | "ends"; mode: "date" | "time" };

export const CreateEventScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, "CreateEvent">>();
  const { createEvent, isCreating } = useEvents();
  const isPrivate = route.params?.isPrivate ?? false;
  const { communities } = useCommunities();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationValue, setLocationValue] = useState<LocationValue>(emptyLocation);
  const [startsAt, setStartsAt] = useState<Date>(defaultStartsAt);
  const [endsAt, setEndsAt] = useState<Date>(defaultEndsAt);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [communityId, setCommunityId] = useState<string | null>(route.params?.communityId ?? null);

  useEffect(() => {
    if (isPrivate && !communityId && communities.length === 1) {
      setCommunityId(communities[0]!.id);
    }
  }, [isPrivate, communityId, communities]);

  const hasCoordinates = locationValue.latitude != null && locationValue.longitude != null;
  const canSubmit =
    Boolean(title.trim()) &&
    Boolean(locationValue.address.trim()) &&
    hasCoordinates &&
    endsAt > startsAt &&
    (!isPrivate || Boolean(communityId));

  const openPicker = (field: "starts" | "ends", mode: "date" | "time") => setPickerTarget({ field, mode });

  const onPickerChange = (event: DateTimePickerEvent, value?: Date) => {
    const target = pickerTarget;
    setPickerTarget(null);
    if (event.type === "dismissed" || !value || !target) return;

    const apply = (current: Date) => {
      const next = new Date(current);
      if (target.mode === "date") {
        next.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());
      } else {
        next.setHours(value.getHours(), value.getMinutes(), 0, 0);
      }
      return next;
    };

    if (target.field === "starts") {
      setStartsAt((current) => apply(current));
    } else {
      setEndsAt((current) => apply(current));
    }
  };

  const submit = async () => {
    if (!canSubmit) return;

    const success = await createEvent({
      title: title.trim(),
      description: description.trim(),
      location: locationValue.address.trim(),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      latitude: locationValue.latitude as number,
      longitude: locationValue.longitude as number,
      ...(isPrivate && communityId ? { isPrivate: true, communityId } : {})
    });

    if (success) {
      navigation.goBack();
    }
  };

  return (
    <AppScreen withHorizontalPadding={false}>
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          className="h-9 w-9 items-center justify-center rounded-md"
        >
          <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
        </Pressable>
        <AppText weight="bold" size="lg">
          {isPrivate ? "New community event" : "New event"}
        </AppText>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
        {isPrivate ? (
          <AppText tone="muted" size="sm" className="-mt-2">
            Private — only members of the community you pick below can see and join this event.
          </AppText>
        ) : null}
        <AppTextInput label="Title" value={title} onChangeText={setTitle} placeholder="Founders meetup" />
        <AppTextInput
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {isPrivate ? (
          <View className="gap-2">
            <AppText weight="medium" size="sm">
              Community
            </AppText>
            {communities.length ? (
              <View className="flex-row flex-wrap gap-2">
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
            ) : (
              <AppText tone="muted" size="sm">
                Create a community first to host a private event for it.
              </AppText>
            )}
          </View>
        ) : null}

        <EventLocationPicker value={locationValue} onChange={setLocationValue} />

        <View className="gap-2">
          <AppText weight="medium" size="sm">
            Starts at
          </AppText>
          <View className="flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={() => openPicker("starts", "date")}
              className="h-11 flex-1 justify-center rounded-md border border-input bg-background px-3"
            >
              <AppText size="sm">{formatDate(startsAt)}</AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => openPicker("starts", "time")}
              className="h-11 flex-1 justify-center rounded-md border border-input bg-background px-3"
            >
              <AppText size="sm">{formatTime(startsAt)}</AppText>
            </Pressable>
          </View>
        </View>

        <View className="gap-2">
          <AppText weight="medium" size="sm">
            Ends at
          </AppText>
          <View className="flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={() => openPicker("ends", "date")}
              className="h-11 flex-1 justify-center rounded-md border border-input bg-background px-3"
            >
              <AppText size="sm">{formatDate(endsAt)}</AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => openPicker("ends", "time")}
              className="h-11 flex-1 justify-center rounded-md border border-input bg-background px-3"
            >
              <AppText size="sm">{formatTime(endsAt)}</AppText>
            </Pressable>
          </View>
          {endsAt <= startsAt ? (
            <AppText tone="danger" size="xs">
              End time must be after the start time.
            </AppText>
          ) : null}
        </View>

        {pickerTarget ? (
          <DateTimePicker
            mode={pickerTarget.mode}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            {...(pickerTarget.mode === "date" ? { minimumDate: new Date() } : {})}
            value={pickerTarget.field === "starts" ? startsAt : endsAt}
            onChange={onPickerChange}
          />
        ) : null}

        <AppButton
          label="Create event"
          loading={isCreating}
          disabled={!canSubmit}
          onPress={() => void submit()}
          className="mt-2 rounded-full"
        />
      </ScrollView>
    </AppScreen>
  );
};
