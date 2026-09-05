import { create } from "zustand";

import { eventsApi } from "@/modules/events/api";
import {
  CreateEventPayload,
  EventAttendee,
  EventFilter,
  EventRsvpStatus,
  StartupEvent,
  UpdateEventPayload
} from "@/modules/events/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

const PAGE_SIZE = 20;

type EventsState = {
  events: StartupEvent[];
  page: number;
  hasMore: boolean;
  selectedEvent: StartupEvent | null;
  attendeesByEventId: Record<string, EventAttendee[]>;
  rsvpStatusByEventId: Record<string, EventRsvpStatus>;
  query: string;
  filter: EventFilter;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  isCreating: boolean;
  isLoadingDetail: boolean;
  mutatingId: string | null;
  errorMessage: string | null;
  setQuery: (query: string) => void;
  setFilter: (filter: EventFilter) => void;
  loadEvents: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  loadMoreEvents: () => Promise<void>;
  selectEvent: (id: string) => Promise<void>;
  clearSelectedEvent: () => void;
  createEvent: (payload: CreateEventPayload) => Promise<boolean>;
  updateEvent: (id: string, payload: UpdateEventPayload) => Promise<boolean>;
  cancelEvent: (id: string, reason: string) => Promise<boolean>;
  rsvpEvent: (id: string) => Promise<boolean>;
  loadAttendees: (id: string) => Promise<void>;
};

const upsertEvent = (events: StartupEvent[], event: StartupEvent) => {
  const exists = events.some((item) => item.id === event.id);
  return exists ? events.map((item) => (item.id === event.id ? { ...item, ...event } : item)) : [event, ...events];
};

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  page: 1,
  hasMore: true,
  selectedEvent: null,
  attendeesByEventId: {},
  rsvpStatusByEventId: {},
  query: "",
  filter: "all",
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  isCreating: false,
  isLoadingDetail: false,
  mutatingId: null,
  errorMessage: null,
  setQuery: (query) => set({ query }),
  setFilter: (filter) => set({ filter }),
  loadEvents: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const { events, hasMore } = await eventsApi.browseEvents(1, PAGE_SIZE);
      set({ events, page: 1, hasMore, isLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  refreshEvents: async () => {
    set({ isRefreshing: true, errorMessage: null });

    try {
      const { events, hasMore } = await eventsApi.browseEvents(1, PAGE_SIZE);
      set({ events, page: 1, hasMore, isRefreshing: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isRefreshing: false });
    }
  },
  loadMoreEvents: async () => {
    if (get().isLoadingMore || !get().hasMore) return;

    set({ isLoadingMore: true, errorMessage: null });

    try {
      const nextPage = get().page + 1;
      const { events, hasMore } = await eventsApi.browseEvents(nextPage, PAGE_SIZE);
      set((state) => ({
        events: [...state.events, ...events],
        page: nextPage,
        hasMore,
        isLoadingMore: false
      }));
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoadingMore: false });
    }
  },
  selectEvent: async (id) => {
    // Deliberately its own flag, not mutatingId — mutatingId also drives the
    // Join/Leave spinner on EventCard (keyed by event id), so reusing it here
    // made opening Details show a spinner on Join/Leave too.
    set({ isLoadingDetail: true, errorMessage: null });

    try {
      const event = await eventsApi.getEvent(id);
      const attendees = await eventsApi.getAttendees(id);
      set((state) => ({
        events: upsertEvent(state.events, { ...event, attendeeCount: attendees.length || event.attendeeCount }),
        selectedEvent: { ...event, attendeeCount: attendees.length || event.attendeeCount },
        attendeesByEventId: { ...state.attendeesByEventId, [id]: attendees },
        isLoadingDetail: false
      }));
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoadingDetail: false });
    }
  },
  clearSelectedEvent: () => set({ selectedEvent: null }),
  createEvent: async (payload) => {
    set({ isCreating: true, errorMessage: null });

    try {
      const event = await eventsApi.createEvent(payload);
      set((state) => ({ events: [event, ...state.events], isCreating: false }));
      useToastStore.getState().show({ type: "success", title: "Event created" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isCreating: false });
      useToastStore.getState().show({ type: "error", title: "Event failed", message: appError.message });
      return false;
    }
  },
  updateEvent: async (id, payload) => {
    set({ mutatingId: id, errorMessage: null });

    try {
      const event = await eventsApi.updateEvent(id, payload);
      set((state) => ({ events: upsertEvent(state.events, event), selectedEvent: event, mutatingId: null }));
      useToastStore.getState().show({ type: "success", title: "Event updated" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingId: null });
      useToastStore.getState().show({ type: "error", title: "Update failed", message: appError.message });
      return false;
    }
  },
  cancelEvent: async (id, reason) => {
    set({ mutatingId: id, errorMessage: null });

    try {
      const event = await eventsApi.cancelEvent(id, reason);
      set((state) => ({ events: upsertEvent(state.events, event), selectedEvent: event, mutatingId: null }));
      useToastStore.getState().show({ type: "success", title: "Event cancelled" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingId: null });
      useToastStore.getState().show({ type: "error", title: "Cancel failed", message: appError.message });
      return false;
    }
  },
  rsvpEvent: async (id) => {
    set({ mutatingId: id, errorMessage: null });

    try {
      const response = await eventsApi.rsvpEvent(id);
      const isConfirmed = response.status === "confirmed";
      set((state) => ({
        rsvpStatusByEventId: { ...state.rsvpStatusByEventId, [id]: response.status },
        events: state.events.map((event) =>
          event.id === id
            ? { ...event, attendeeCount: Math.max(0, event.attendeeCount + (isConfirmed ? 1 : -1)) }
            : event
        ),
        selectedEvent:
          state.selectedEvent?.id === id
            ? { ...state.selectedEvent, attendeeCount: Math.max(0, state.selectedEvent.attendeeCount + (isConfirmed ? 1 : -1)) }
            : state.selectedEvent,
        mutatingId: null
      }));
      useToastStore.getState().show({ type: "success", title: response.message });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingId: null });
      useToastStore.getState().show({ type: "error", title: "RSVP failed", message: appError.message });
      return false;
    }
  },
  loadAttendees: async (id) => {
    set({ mutatingId: id, errorMessage: null });

    try {
      const attendees = await eventsApi.getAttendees(id);
      set((state) => ({
        attendeesByEventId: { ...state.attendeesByEventId, [id]: attendees },
        mutatingId: null
      }));
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingId: null });
    }
  }
}));
