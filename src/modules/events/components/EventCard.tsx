import { memo } from "react";
import { Linking, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { getGoogleMapsUrl } from "@/services/location/geocoding";
import { StartupEvent } from "@/modules/events/types";

type EventCardProps = {
  event: StartupEvent;
  isJoined: boolean;
  isMutating: boolean;
  onRsvp: (id: string) => void;
  onView: (id: string) => void;
};

const formatEventRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const date = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(startDate);
  const startTime = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(startDate);
  const endTime = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(endDate);
  return `${date}, ${startTime} - ${endTime}`;
};

export const EventCard = memo(({ event, isJoined, isMutating, onRsvp, onView }: EventCardProps) => {
  const colors = useThemeTokens();
  const mapsUrl = getGoogleMapsUrl({
    address: event.location,
    latitude: event.latitude,
    longitude: event.longitude
  });

  return (
    <View className="rounded-md border border-border bg-surface p-5">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <AppText weight="bold" size="xl">
            {event.title}
          </AppText>
          <View className="mt-3 flex-row flex-wrap items-center gap-2">
            <AppText tone="muted" size="sm">
              Hosted by Startuphouze member
            </AppText>
            <View className="rounded-md bg-background px-3 py-1">
              <AppText weight="semibold" size="sm">
                {event.status}
              </AppText>
            </View>
          </View>
        </View>
        <View className="rounded-md bg-primary/10 px-3 py-1">
          <AppText tone="primary" size="sm" weight="medium">
            meetup
          </AppText>
        </View>
      </View>

      <AppText className="mt-4 leading-6">{event.description}</AppText>

      <View className="mt-4 gap-3">
        <View className="flex-row items-start gap-3">
          <Feather name="clock" size={16} color={colors.muted} style={{ marginTop: 2 }} />
          <AppText tone="muted" className="flex-1 leading-5">
            {formatEventRange(event.startsAt, event.endsAt)}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="link"
          onPress={() => void Linking.openURL(mapsUrl)}
          className="flex-row items-start gap-3"
        >
          <Feather name="map-pin" size={16} color={colors.primary} style={{ marginTop: 2 }} />
          <AppText tone="primary" className="flex-1 leading-5 underline">
            {event.location}
          </AppText>
        </Pressable>
        <View className="flex-row items-start gap-3">
          <Feather name="users" size={16} color={colors.muted} style={{ marginTop: 2 }} />
          <AppText tone="muted" className="flex-1 leading-5">
            {event.attendeeCount} joined
          </AppText>
        </View>
      </View>

      <View className="mt-5 flex-row flex-wrap items-center gap-3">
        <AppButton
          label={isJoined ? "Leave event" : "Join event"}
          variant={isJoined ? "outline" : "primary"}
          loading={isMutating}
          disabled={event.status === "CANCELLED"}
          onPress={() => onRsvp(event.id)}
          className="h-11 px-5"
        />
        <AppButton label="Details" variant="outline" onPress={() => onView(event.id)} className="h-11 px-5" />
        {isJoined ? (
          <View className="rounded-md bg-background px-3 py-2">
            <AppText tone="success" size="sm" weight="medium">
              You are going
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
});

EventCard.displayName = "EventCard";
