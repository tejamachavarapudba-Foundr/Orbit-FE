import { useState } from "react";
import { Alert, Linking, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { EventLocationPicker } from "@/modules/events/components/EventLocationPicker";
import { useEventDetail } from "@/modules/events/hooks";
import { getGoogleMapsUrl, LocationValue } from "@/services/location/geocoding";

export const EventDetailPanel = () => {
  const colors = useThemeTokens();
  const { selectedEvent, attendees, mutatingId, clearSelectedEvent, updateEvent, cancelEvent } = useEventDetail();
  const [locationValue, setLocationValue] = useState<LocationValue>({
    address: "",
    latitude: null,
    longitude: null
  });
  const [reason, setReason] = useState("");

  if (!selectedEvent) {
    return null;
  }

  const isMutating = mutatingId === selectedEvent.id;
  const mapsUrl = getGoogleMapsUrl({
    address: selectedEvent.location,
    latitude: selectedEvent.latitude,
    longitude: selectedEvent.longitude
  });

  const submitUpdate = async () => {
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
  };

  return (
    <View className="mt-6 rounded-md border border-border bg-surface p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <AppText weight="bold" size="xl">
            {selectedEvent.title}
          </AppText>
          <AppText tone={selectedEvent.status === "ACTIVE" ? "success" : "danger"} className="mt-1">
            {selectedEvent.status}
          </AppText>
        </View>
        <AppButton label="Close" variant="outline" onPress={clearSelectedEvent} className="h-10 px-4" />
      </View>

      <AppText className="mt-4 leading-6">{selectedEvent.description}</AppText>
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(mapsUrl)} className="mt-3 flex-row items-start gap-2">
        <Feather name="map-pin" size={16} color={colors.primary} style={{ marginTop: 2 }} />
        <AppText tone="primary" className="flex-1 leading-5 underline">
          {selectedEvent.location}
        </AppText>
      </Pressable>
      {selectedEvent.cancellationReason ? (
        <AppText tone="danger" className="mt-3">
          Cancelled: {selectedEvent.cancellationReason}
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
                  {attendee.headline || attendee.company || "Startuphouze member"}
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
          loading={isMutating}
          disabled={!locationValue.address.trim() || locationValue.latitude == null}
          onPress={() => void submitUpdate()}
          className="mt-3"
        />
        <AppTextInput label="Cancellation reason" value={reason} onChangeText={setReason} className="mt-4" />
        <AppButton
          label="Cancel event"
          variant="outline"
          loading={isMutating}
          disabled={!reason.trim() || selectedEvent.status === "CANCELLED"}
          onPress={() =>
            Alert.alert("Cancel event", `Cancel ${selectedEvent.title}?`, [
              { text: "No", style: "cancel" },
              { text: "Cancel event", style: "destructive", onPress: () => void cancelEvent(selectedEvent.id, reason.trim()) }
            ])
          }
          className="mt-3"
        />
      </View>
    </View>
  );
};
