import { appConfig } from "@/constants/config";
import { secureStorage } from "@/services/storage/secureStorage";

const storageKeyForUser = (userId: string) => `${appConfig.viewedStartupsKey}.${userId}`;

export const loadViewedStartupIds = async (userId: string): Promise<string[]> => {
  const raw = await secureStorage.getItem(storageKeyForUser(userId));
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
};

export const saveViewedStartupIds = async (userId: string, ids: string[]) => {
  await secureStorage.setItem(storageKeyForUser(userId), JSON.stringify(ids));
};
