import { useEffect, useMemo, useRef } from "react";

import { EventFilter } from "@/modules/events/types";
import { useEventsStore } from "@/modules/events/store";

export const eventFilters: { label: string; value: EventFilter }[] = [
  { label: "All events", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Joined", value: "joined" },
  { label: "Cancelled", value: "cancelled" }
];

export const useEvents = () => {
  const events = useEventsStore((state) => state.events);
  const rsvpStatusByEventId = useEventsStore((state) => state.rsvpStatusByEventId);
  const query = useEventsStore((state) => state.query);
  const filter = useEventsStore((state) => state.filter);
  const isLoading = useEventsStore((state) => state.isLoading);
  const isRefreshing = useEventsStore((state) => state.isRefreshing);
  const isCreating = useEventsStore((state) => state.isCreating);
  const mutatingId = useEventsStore((state) => state.mutatingId);
  const errorMessage = useEventsStore((state) => state.errorMessage);
  const setQuery = useEventsStore((state) => state.setQuery);
  const setFilter = useEventsStore((state) => state.setFilter);
  const loadEvents = useEventsStore((state) => state.loadEvents);
  const refreshEvents = useEventsStore((state) => state.refreshEvents);
  const createEvent = useEventsStore((state) => state.createEvent);
  const selectEvent = useEventsStore((state) => state.selectEvent);
  const rsvpEvent = useEventsStore((state) => state.rsvpEvent);
  const hasRequestedRef = useRef(false);

  // Fires once per mount — gating on "events.length === 0" instead would
  // never converge for an account with genuinely zero events: every load
  // resolves back to length 0, re-satisfying the condition and firing the
  // request again forever.
  useEffect(() => {
    if (hasRequestedRef.current || isLoading) {
      return;
    }
    hasRequestedRef.current = true;
    void loadEvents();
  }, [isLoading, loadEvents]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const now = Date.now();

    return events.filter((event) => {
      const isJoined = rsvpStatusByEventId[event.id] === "confirmed";
      const matchesFilter =
        filter === "all" ||
        (filter === "upcoming" && event.status === "ACTIVE" && new Date(event.startsAt).getTime() >= now) ||
        (filter === "joined" && isJoined) ||
        (filter === "cancelled" && event.status === "CANCELLED");
      const haystack = [event.title, event.description, event.location, event.status].join(" ").toLowerCase();

      return matchesFilter && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [events, filter, query, rsvpStatusByEventId]);

  return {
    events: filteredEvents,
    rsvpStatusByEventId,
    query,
    filter,
    isLoading,
    isRefreshing,
    isCreating,
    mutatingId,
    errorMessage,
    setQuery,
    setFilter,
    loadEvents,
    refreshEvents,
    createEvent,
    selectEvent,
    rsvpEvent
  };
};

export const useEventDetail = () => {
  const selectedEvent = useEventsStore((state) => state.selectedEvent);
  const attendeesByEventId = useEventsStore((state) => state.attendeesByEventId);
  const mutatingId = useEventsStore((state) => state.mutatingId);
  const clearSelectedEvent = useEventsStore((state) => state.clearSelectedEvent);
  const updateEvent = useEventsStore((state) => state.updateEvent);
  const cancelEvent = useEventsStore((state) => state.cancelEvent);
  const loadAttendees = useEventsStore((state) => state.loadAttendees);

  return {
    selectedEvent,
    attendees: selectedEvent ? (attendeesByEventId[selectedEvent.id] ?? []) : [],
    mutatingId,
    clearSelectedEvent,
    updateEvent,
    cancelEvent,
    loadAttendees
  };
};
