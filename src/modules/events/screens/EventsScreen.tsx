import { useCallback } from "react";
import { FlatList, ListRenderItem, TextInput, View } from "react-native";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChip } from "@/components/ui/FilterChip";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { EventCard } from "@/modules/events/components/EventCard";
import { EventComposer } from "@/modules/events/components/EventComposer";
import { EventDetailPanel } from "@/modules/events/components/EventDetailPanel";
import { eventFilters, useEvents } from "@/modules/events/hooks";
import { StartupEvent } from "@/modules/events/types";

export const EventsScreen = () => {
  const colors = useThemeTokens();
  const {
    events,
    rsvpStatusByEventId,
    query,
    filter,
    isLoading,
    isRefreshing,
    mutatingId,
    errorMessage,
    setQuery,
    setFilter,
    loadEvents,
    refreshEvents,
    selectEvent,
    rsvpEvent
  } = useEvents();

  const renderEvent = useCallback<ListRenderItem<StartupEvent>>(
    ({ item }) => (
      <View className="w-full max-w-2xl self-center">
        <EventCard
          event={item}
          isJoined={rsvpStatusByEventId[item.id] === "confirmed"}
          isMutating={mutatingId === item.id}
          onRsvp={(id) => void rsvpEvent(id)}
          onView={(id) => void selectEvent(id)}
        />
      </View>
    ),
    [mutatingId, rsvpEvent, rsvpStatusByEventId, selectEvent]
  );

  return (
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        refreshing={isRefreshing}
        onRefresh={() => void refreshEvents()}
        contentContainerStyle={{ gap: 16, paddingHorizontal: 20, paddingBottom: 40 }}
        ListHeaderComponent={
          <View className="w-full max-w-2xl self-center pt-6">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <AppText tone="primary" weight="bold" size="lg">
                    calendar
                  </AppText>
                  <AppText size="2xl" weight="bold">
                    Events
                  </AppText>
                </View>
                <AppText tone="muted" className="mt-2 leading-6">
                  Meet founders, co-founders and investors through focused Foundr gatherings.
                </AppText>
              </View>
              <View className="max-w-[140px] rounded-md bg-background px-3 py-2">
                <AppText tone="muted" size="xs" className="text-right leading-5">
                  Host together, 
                  grow together.
                </AppText>
              </View>
            </View>

            <View className="mt-5 rounded-md border border-border bg-surface px-4">
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search events, hosts, locations..."
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                className="h-12 text-base text-text"
              />
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              {eventFilters.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  isActive={filter === option.value}
                  activeTone="primary"
                  onPress={() => setFilter(option.value)}
                />
              ))}
            </View>

            <View className="mt-5">
              <EventComposer />
            </View>

            <EventDetailPanel />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="w-full max-w-2xl self-center gap-3">
              <Skeleton className="h-44 w-full rounded-md" />
              <Skeleton className="h-44 w-full rounded-md" />
            </View>
          ) : errorMessage ? (
            <View className="w-full max-w-2xl self-center">
              <ErrorState message={errorMessage} onRetry={() => void loadEvents()} />
            </View>
          ) : (
            <View className="w-full max-w-2xl self-center">
              <EmptyState
                title="No events found"
                message="Try another filter or check upcoming Foundr events soon."
              />
            </View>
          )
        }
      />
    </AppScreen>
  );
};
