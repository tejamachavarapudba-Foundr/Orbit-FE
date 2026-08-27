import { apiClient } from "@/services/api/client";
import {
  CancelEventResponse,
  CreateEventPayload,
  EventAttendee,
  EventRsvpResponse,
  RawStartupEvent,
  UpdateEventPayload
} from "@/modules/events/types";

export const normalizeEvent = (event: RawStartupEvent) => ({
  ...event,
  status: event.status ?? "ACTIVE",
  cancellationReason: event.cancellationReason ?? null,
  attendeeCount: event._count?.attendees ?? event.attendeeCount ?? 0,
  isAttending: event.isAttending ?? Boolean(event.attendees?.length)
});

export const eventsApi = {
  getEvents: async () => {
    const response = await apiClient.get<RawStartupEvent[]>("/events");
    return response.data.map(normalizeEvent);
  },
  getCommunityEvents: async (communityId: string) => {
    const response = await apiClient.get<RawStartupEvent[]>(`/events/community/${communityId}`);
    return response.data.map(normalizeEvent);
  },
  getEvent: async (id: string) => {
    const response = await apiClient.get<RawStartupEvent>(`/events/${id}`);
    return normalizeEvent(response.data);
  },
  createEvent: async (payload: CreateEventPayload) => {
    const response = await apiClient.post<RawStartupEvent>("/events", payload);
    return normalizeEvent(response.data);
  },
  updateEvent: async (id: string, payload: UpdateEventPayload) => {
    const response = await apiClient.patch<RawStartupEvent>(`/events/${id}`, payload);
    return normalizeEvent(response.data);
  },
  cancelEvent: async (id: string, reason: string) => {
    const response = await apiClient.delete<CancelEventResponse>(`/events/${id}`, {
      data: { reason, Reason: reason }
    });
    return normalizeEvent(response.data);
  },
  rsvpEvent: async (id: string) => {
    const response = await apiClient.post<EventRsvpResponse>(`/events/${id}/rsvp`);
    return response.data;
  },
  getAttendees: async (id: string) => {
    const response = await apiClient.get<EventAttendee[]>(`/events/${id}/attendees`);
    return response.data;
  }
};
