import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { EventLocationPicker } from "@/modules/events/components/EventLocationPicker";
import { EventShareSheet } from "@/modules/events/components/EventShareSheet";
import { useEventDetail } from "@/modules/events/hooks";
import { getCountdownLabel, getDisplayStatus, getHostName, isEventExpired } from "@/modules/events/utils";
import { getGoogleMapsUrl, LocationValue } from "@/services/location/geocoding";
import { iconSize } from "@/theme/designTokens";
import { MainStackParamList } from "@/app/navigation/types";

export const EventDetailScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, "EventDetail">>();
  const {
    selectedEvent,
    attendees,
    isLoadingDetail,
    mutatingId,
    selectEvent,
    clearSelectedEvent,
    updateEvent,
    cancelEvent
  } = useEventDetail();
  const [locationValue, setLocationValue] = useState<LocationValue>({
    address: "",
    latitude: null,
    longitude: null
  });
  const [reason, setReason] = useState("");
  const [isShareVisible, setIsShareVisible] = useState(false);

  const eventId = route.params.id;

  useEffect(() => {
    void selectEvent(eventId);
    return () => clearSelectedEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const isLoaded = selectedEvent?.id === eventId;

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
          Event details
        </AppText>
      </View>

      {!isLoaded ? (
        isLoadingDetail ? (
          <View className="gap-3 px-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-40 w-full rounded-md" />
          </View>
        ) : null
      ) : (
        <EventDetailContent
          event={selectedEvent}
          attendees={attendees}
          isMutating={mutatingId === selectedEvent.id}
          locationValue={locationValue}
          setLocationValue={setLocationValue}
          reason={reason}
          setReason={setReason}
          onShare={() => setIsShareVisible(true)}
          onUpdateLocation={async () => {
            if (!locationValue.address.trim() || locationValue.latitude == null || locationValue.longitude == null) {
              return;
            }
            const success = await updateEvent(selectedEvent.id, {
              location: locationValue.address.trim(),
              latitude: locationValue.latitude,
              longitude: locationValue.longitude
            });
            if (success) {
              setLocationValue({ address: "", latitude: null, longitude: null });
            }
          }}
          onCancelEvent={() =>
            Alert.alert("Cancel event", `Cancel ${selectedEvent.title}?`, [
              { text: "No", style: "cancel" },
              { text: "Cancel event", style: "destructive", onPress: () => void cancelEvent(selectedEvent.id, reason.trim()) }
            ])
          }
          colors={colors}
        />
      )}

      {isLoaded ? (
        <EventShareSheet visible={isShareVisible} event={selectedEvent} onClose={() => setIsShareVisible(false)} />
      ) : null}
    </AppScreen>
  );
};

type EventDetailContentProps = {
  event: NonNullable<ReturnType<typeof useEventDetail>["selectedEvent"]>;
  attendees: ReturnType<typeof useEventDetail>["attendees"];
  isMutating: boolean;
  locationValue: LocationValue;
  setLocationValue: (value: LocationValue) => void;
  reason: string;
  setReason: (value: string) => void;
  onShare: () => void;
  onUpdateLocation: () => Promise<void>;
  onCancelEvent: () => void;
  colors: ReturnType<typeof useThemeTokens>;
};

const EventDetailContent = ({
  event,
  attendees,
  isMutating,
  locationValue,
  setLocationValue,
  reason,
  setReason,
  onShare,
  onUpdateLocation,
  onCancelEvent,
  colors
}: EventDetailContentProps) => {
  const mapsUrl = getGoogleMapsUrl({ address: event.location, latitude: event.latitude, longitude: event.longitude });
  const displayStatus = getDisplayStatus(event);
  const countdownLabel = getCountdownLabel(event);
  const canJoin = !isEventExpired(event) && event.status !== "CANCELLED";

  return (
    <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <AppText weight="bold" size="xl">
            {event.title}
          </AppText>
          <AppText tone="muted" size="sm" className="mt-1">
            Hosted by {getHostName(event)}
          </AppText>
          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            <AppText
              tone={displayStatus === "Active" ? "success" : displayStatus === "Cancelled" ? "danger" : "muted"}
              weight="semibold"
              size="sm"
            >
              {displayStatus}
            </AppText>
            {countdownLabel ? (
              <View className="rounded-full bg-primary/10 px-3 py-1">
                <AppText tone="primary" weight="semibold" size="xs">
                  {countdownLabel}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share event"
          onPress={onShare}
          className="h-10 w-10 items-center justify-center rounded-full border border-input"
        >
          <Feather name="share-2" size={iconSize.md} color={colors.text} />
        </Pressable>
      </View>

      <AppText className="mt-4 leading-6">{event.description}</AppText>
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(mapsUrl)} className="mt-3 flex-row items-start gap-2">
        <Feather name="map-pin" size={16} color={colors.primary} style={{ marginTop: 2 }} />
        <AppText tone="primary" className="flex-1 leading-5 underline">
          {event.location}
        </AppText>
      </Pressable>
      {event.cancellationReason ? (
        <AppText tone="danger" className="mt-3">
          Cancelled: {event.cancellationReason}
        </AppText>
      ) : null}

      <View className="mt-5 rounded-md bg-background p-4">
        <AppText weight="bold">Attendees ({attendees.length})</AppText>
        <View className="mt-3 gap-2">
          {attendees.length ? (
            attendees.map((attendee) => (
              <View key={attendee.id} className="rounded-md border border-border bg-surface p-3">
                <AppText weight="semibold">{attendee.fullName}</AppText>
                <AppText tone="muted" size="sm" className="mt-1">
                  {attendee.headline || attendee.company || "Orbit member"}
                </AppText>
              </View>
            ))
          ) : (
            <AppText tone="muted">No attendees yet.</AppText>
          )}
        </View>
      </View>

      <View className="mt-5 rounded-md bg-background p-4">
        <AppText weight="bold">Host tools</AppText>
        <View className="mt-3">
          <EventLocationPicker value={locationValue} onChange={setLocationValue} />
        </View>
        <AppButton
          label="Update location"
          variant="outline"
          size="default"
          loading={isMutating}
          disabled={!locationValue.address.trim() || locationValue.latitude == null}
          onPress={() => void onUpdateLocation()}
          className="mt-3 rounded-full"
        />
        {canJoin ? (
          <>
            <AppTextInput label="Cancellation reason" value={reason} onChangeText={setReason} className="mt-4" />
            <AppButton
              label="Cancel event"
              variant="outline"
              size="default"
              loading={isMutating}
              disabled={!reason.trim()}
              onPress={onCancelEvent}
              className="mt-3 rounded-full"
            />
          </>
        ) : null}
      </View>
    </ScrollView>
  );
};
