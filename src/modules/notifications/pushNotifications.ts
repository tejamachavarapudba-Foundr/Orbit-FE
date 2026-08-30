import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler
} from "@react-native-firebase/messaging";

import { notificationsApi } from "@/modules/notifications/api";
import { useToastStore } from "@/store/toastStore";
import { logger } from "@/utils/logger";

const messaging = getMessaging();

// Must run at module scope (not inside a component) so it's registered
// before the JS bundle finishes loading — otherwise messages that arrive
// while the app is backgrounded/killed can be missed.
setBackgroundMessageHandler(messaging, async () => {});

let currentToken: string | null = null;
let unsubscribeTokenRefresh: (() => void) | null = null;
let unsubscribeForegroundMessage: (() => void) | null = null;

/** Requests notification permission, registers the device's FCM token with the backend, and starts listening for refreshes/foreground messages. Call once after the user is authenticated. */
export const startPushNotifications = async () => {
  try {
    const status = await requestPermission(messaging);
    const isAuthorized =
      status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;

    if (!isAuthorized) {
      return;
    }

    currentToken = await getToken(messaging);
    await notificationsApi.registerDeviceToken(currentToken);

    unsubscribeTokenRefresh?.();
    unsubscribeTokenRefresh = onTokenRefresh(messaging, async (token) => {
      currentToken = token;
      await notificationsApi.registerDeviceToken(token).catch((error) => logger.warn("Failed to refresh device token", error));
    });

    unsubscribeForegroundMessage?.();
    unsubscribeForegroundMessage = onMessage(messaging, async (message) => {
      const title = message.notification?.title ?? "New notification";
      const body = message.notification?.body ?? "";
      useToastStore.getState().show({ type: "info", title, message: body });
    });
  } catch (error) {
    logger.warn("Failed to set up push notifications", error);
  }
};

/** Removes this device's token from the backend so it stops receiving pushes. Call on logout. */
export const stopPushNotifications = async () => {
  unsubscribeTokenRefresh?.();
  unsubscribeTokenRefresh = null;
  unsubscribeForegroundMessage?.();
  unsubscribeForegroundMessage = null;

  if (!currentToken) {
    return;
  }

  await notificationsApi.unregisterDeviceToken(currentToken).catch((error) => logger.warn("Failed to unregister device token", error));
  currentToken = null;
};
