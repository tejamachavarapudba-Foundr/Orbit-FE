import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from './api';
import { Notification } from './types';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    // Patches just the one row instead of invalidating the whole list —
    // a refetch would hand back a fresh array with a new object reference
    // for every notification, defeating NotificationCard's React.memo and
    // re-rendering all ~200 rows for a single tap.
    onSuccess: (_updated, id) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old: Notification[] | undefined) =>
        old?.map((notification: Notification) => (notification.id === id ? { ...notification, isRead: true } : notification))
      );
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old: Notification[] | undefined) =>
        old?.map((notification: Notification) => ({ ...notification, isRead: true }))
      );
    },
  });
};

/** Marks a specific set of notifications read — used instead of
 * markAllAsRead wherever "read all" should only apply to what's actually
 * visible (e.g. the bell list, once messages/projects/jobs/events/connection
 * requests moved to their own badges and shouldn't be silently cleared by
 * opening an unrelated screen). */
export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => notificationsApi.markAsRead(id))),
    onSuccess: (_updated, ids) => {
      const idSet = new Set(ids);
      queryClient.setQueryData<Notification[]>(['notifications'], (old: Notification[] | undefined) =>
        old?.map((notification: Notification) => (idSet.has(notification.id) ? { ...notification, isRead: true } : notification))
      );
    },
  });
};