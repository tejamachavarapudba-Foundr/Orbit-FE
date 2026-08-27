import { EventFilter, EventRsvpStatus, StartupEvent } from "@/modules/events/types";

export const isEventExpired = (event: StartupEvent) => new Date(event.endsAt).getTime() < Date.now();

export const getDisplayStatus = (event: StartupEvent): "Active" | "Completed" | "Cancelled" => {
  if (event.status === "CANCELLED") return "Cancelled";
  return isEventExpired(event) ? "Completed" : "Active";
};

// Only meaningful for events that haven't started/ended yet — null for
// cancelled or already-expired ones so callers can skip rendering it.
export const getCountdownLabel = (event: StartupEvent): string | null => {
  if (event.status === "CANCELLED" || isEventExpired(event)) return null;

  const diffMs = new Date(event.startsAt).getTime() - Date.now();
  if (diffMs <= 0) return "Happening now";

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return "1 day to go";
  return `${diffDays} days to go`;
};

export const getHostName = (event: StartupEvent) => event.host?.fullName?.trim() || "Startuphouze member";

// A local RSVP toggle (once the user has acted this session) always wins
// over the server snapshot — otherwise fall back to isAttending, which
// covers community members auto-joined at event creation.
export const getIsJoined = (event: StartupEvent, rsvpStatus: EventRsvpStatus | undefined) =>
  rsvpStatus ? rsvpStatus === "confirmed" : event.isAttending;

// Shared by the public Events feed and the community events list so both
// filter/search the exact same way.
export const filterEvents = (
  events: StartupEvent[],
  filter: EventFilter,
  query: string,
  rsvpStatusByEventId: Record<string, EventRsvpStatus>
) => {
  const normalizedQuery = query.trim().toLowerCase();
  const now = Date.now();

  return events.filter((event) => {
    const isJoined = getIsJoined(event, rsvpStatusByEventId[event.id]);
    const matchesFilter =
      filter === "all" ||
      (filter === "upcoming" && event.status === "ACTIVE" && new Date(event.startsAt).getTime() >= now) ||
      (filter === "joined" && isJoined) ||
      (filter === "completed" && event.status === "ACTIVE" && new Date(event.endsAt).getTime() < now) ||
      (filter === "cancelled" && event.status === "CANCELLED");
    const haystack = [event.title, event.description, event.location, event.status].join(" ").toLowerCase();

    return matchesFilter && (!normalizedQuery || haystack.includes(normalizedQuery));
  });
};
