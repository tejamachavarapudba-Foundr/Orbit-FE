import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

// Persists the React Query cache to disk so a cold start can paint
// yesterday's feed/jobs/discover/projects data immediately instead of a
// blank skeleton, while React Query's normal staleTime still triggers a
// background refetch to replace it with live data.
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "orbit-query-cache"
});

export const QUERY_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
