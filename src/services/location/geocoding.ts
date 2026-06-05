export type LocationValue = {
  address: string;
  latitude: number | null;
  longitude: number | null;
};

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

const NOMINATIM_HEADERS = {
  "User-Agent": "FoundrApp/1.0 (events-location)"
};

export const searchPlaces = async (query: string): Promise<NominatimResult[]> => {
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    return [];
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=6`;
  const response = await fetch(url, { headers: NOMINATIM_HEADERS });

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as NominatimResult[];
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
  const response = await fetch(url, { headers: NOMINATIM_HEADERS });

  if (!response.ok) {
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }

  const data = (await response.json()) as { display_name?: string };
  return data.display_name ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
};

export const getGoogleMapsUrl = (value: LocationValue) => {
  if (value.latitude != null && value.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${value.latitude},${value.longitude}`;
  }

  if (value.address.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value.address.trim())}`;
  }

  return "https://www.google.com/maps";
};

export const getGoogleMapsDirectionsUrl = (value: LocationValue) => {
  if (value.latitude != null && value.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${value.latitude},${value.longitude}`;
  }

  if (value.address.trim()) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(value.address.trim())}`;
  }

  return "https://www.google.com/maps";
};
