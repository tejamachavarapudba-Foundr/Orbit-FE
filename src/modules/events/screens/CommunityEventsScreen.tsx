import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ListRenderItem, Pressable, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useCommunities } from "@/modules/community/hooks";
import { EventCard } from "@/modules/events/components/EventCard";
import { EventStatusFilterModal } from "@/modules/events/components/EventStatusFilterModal";
import { eventsApi } from "@/modules/events/api";
import { eventFilters } from "@/modules/events/hooks";
import { useEventsStore } from "@/modules/events/store";
import { EventFilter, StartupEvent } from "@/modules/events/types";
import { filterEvents, getIsJoined } from "@/modules/events/utils";
import { iconSize } from "@/theme/designTokens";
import { MainStackParamList } from "@/app/navigation/types";

export const CommunityEventsScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { communities, isLoading: isLoadingCommunities } = useCommunities();
  const rsvpStatusByEventId = useEventsStore((state) => state.rsvpStatusByEventId);
  const eventMutatingId = useEventsStore((state) => state.mutatingId);
  const rsvpEvent = useEventsStore((state) => state.rsvpEvent);

  const [events, setEvents] = useState<StartupEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<EventFilter>("all");
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    if (isLoadingCommunities) return;
    if (!communities.length) {
      setEvents([]);
      setIsLoadingEvents(false);
      return;
    }

    let cancelled = false;
    setIsLoadingEvents(true);
    Promise.all(communities.map((community) => eventsApi.getCommunityEvents(community.id)))
      .then((lists) => {
        if (cancelled) return;
        const merged = lists.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setEvents(merged);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingEvents(false);
      });
    return () => {
      cancelled = true;
    };
  }, [communities, isLoadingCommunities]);

  const filteredEvents = useMemo(
    () => filterEvents(events, filter, query, rsvpStatusByEventId),
    [events, filter, query, rsvpStatusByEventId]
  );

  const openDetail = useCallback((id: string) => navigation.navigate("EventDetail", { id }), [navigation]);

  const renderEvent = useCallback<ListRenderItem<StartupEvent>>(
    ({ item }) => (
      <View className="w-full max-w-2xl self-center">
        <EventCard
          event={item}
          isJoined={getIsJoined(item, rsvpStatusByEventId[item.id])}
          isMutating={eventMutatingId === item.id}
          onRsvp={(id) => void rsvpEvent(id)}
          onView={openDetail}
        />
      </View>
    ),
    [eventMutatingId, openDetail, rsvpEvent, rsvpStatusByEventId]
  );

  const isLoading = isLoadingCommunities || isLoadingEvents;

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
          Community events
        </AppText>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={9}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={{ gap: 16, paddingHorizontal: 20, paddingBottom: 40 }}
        ListHeaderComponent={
          <View className="w-full max-w-2xl self-center pb-4">
            <View className="rounded-md border border-border bg-surface px-4">
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search community events..."
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                className="h-12 text-base text-text"
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setIsFilterVisible(true)}
              className="mt-4 flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-2.5"
            >
              <AppText size="sm">
                Status:{" "}
                <AppText size="sm" weight="semibold">
                  {eventFilters.find((option) => option.value === filter)?.label ?? "All"}
                </AppText>
              </AppText>
              <Feather name="sliders" size={iconSize.sm} color={colors.text} />
            </Pressable>

            <EventStatusFilterModal
              visible={isFilterVisible}
              onClose={() => setIsFilterVisible(false)}
              value={filter}
              onChange={setFilter}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="w-full max-w-2xl self-center gap-3">
              <Skeleton className="h-44 w-full rounded-md" />
              <Skeleton className="h-44 w-full rounded-md" />
            </View>
          ) : (
            <View className="w-full max-w-2xl self-center">
              <EmptyState
                title="No community events found"
                message={
                  communities.length
                    ? "Try another filter, or host one from a community's own page."
                    : "Join or create a community first, then host private events for its members."
                }
              />
            </View>
          )
        }
      />

      {communities.length ? (
        <View className="px-4 pb-4">
          <AppButton
            label="Host event"
            className="rounded-full"
            onPress={() => navigation.navigate("CreateEvent", { isPrivate: true })}
          />
        </View>
      ) : null}
    </AppScreen>
  );
};
