export type EventStatus = "ACTIVE" | "CANCELLED";

export type EventAttendee = {
  id: string;
  fullName: string;
  avatarUrl: string;
  headline: string;
  company: string;
};

export type StartupEvent = {
  id: string;
  hostId: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  coverUrl: string;
  latitude: number | null;
  longitude: number | null;
  status: EventStatus;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  attendeeCount: number;
};

export type RawStartupEvent = Omit<StartupEvent, "attendeeCount" | "status" | "cancellationReason"> &
  Partial<Pick<StartupEvent, "attendeeCount" | "status" | "cancellationReason">> & {
    _count?: {
      attendees: number;
    };
  };

export type CreateEventPayload = {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  latitude: number;
  longitude: number;
  isPrivate?: boolean;
  communityId?: string;
  inviteeIds?: string[];
};

export type UpdateEventPayload = Partial<CreateEventPayload>;

export type CancelEventResponse = RawStartupEvent;

export type EventRsvpStatus = "confirmed" | "cancelled";

export type EventRsvpResponse = {
  status: EventRsvpStatus;
  message: string;
  data?: {
    id: string;
    eventId: string;
    userId: string;
    createdAt: string;
    user: {
      fullName: string;
      avatarUrl: string;
    };
  };
};

export type EventFilter = "all" | "upcoming" | "joined" | "cancelled";
