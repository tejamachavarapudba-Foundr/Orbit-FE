import { useCallback, useState } from "react";
import { FlatList, ListRenderItem, Pressable, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { EventCard } from "@/modules/events/components/EventCard";
import { EventComposer } from "@/modules/events/components/EventComposer";
import { EventStatusFilterModal } from "@/modules/events/components/EventStatusFilterModal";
import { eventFilters, useEvents } from "@/modules/events/hooks";
import { StartupEvent } from "@/modules/events/types";
import { getIsJoined } from "@/modules/events/utils";
import { iconSize } from "@/theme/designTokens";
import { MainStackParamList } from "@/app/navigation/types";

export const EventsScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const {
    events,
    hasMore,
    rsvpStatusByEventId,
    query,
    filter,
    isLoading,
    isRefreshing,
    errorMessage,
    setQuery,
    setFilter,
    loadEvents,
    refreshEvents,
    loadMore,
    mutatingId,
    rsvpEvent
  } = useEvents();

  const openDetail = useCallback((id: string) => navigation.navigate("EventDetail", { id }), [navigation]);

  const renderEvent = useCallback<ListRenderItem<StartupEvent>>(
    ({ item }) => (
      <View className="w-full max-w-2xl self-center">
        <EventCard
          event={item}
          isJoined={getIsJoined(item, rsvpStatusByEventId[item.id])}
          isMutating={mutatingId === item.id}
          onRsvp={(id) => void rsvpEvent(id)}
          onView={openDetail}
        />
      </View>
    ),
    [mutatingId, openDetail, rsvpEvent, rsvpStatusByEventId]
  );

  return (
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={9}
        updateCellsBatchingPeriod={50}
        refreshing={isRefreshing}
        onRefresh={() => void refreshEvents()}
        onEndReached={hasMore ? () => void loadMore() : undefined}
        onEndReachedThreshold={0.4}
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
                  Meet founders, co-founders and investors through focused Orbit gatherings.
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

            <View className="mt-5">
              <EventComposer />
            </View>
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
                message="Try another filter or check upcoming Orbit events soon."
              />
            </View>
          )
        }
      />
    </AppScreen>
  );
};
