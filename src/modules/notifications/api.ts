import { apiClient } from '@/services/api/client';
import { Notification } from './types';

export const notificationsApi = {
  async getNotifications(): Promise<Notification[]> {
    const { data } = await apiClient.get('/notifications');
    return data;
  },

  async markAsRead(id: string) {
    const { data } = await apiClient.patch(
      `/notifications/${id}/read`,
    );
    return data;
  },

  async markAllAsRead() {
    const { data } = await apiClient.patch(
      '/notifications/read-all',
    );
    return data;
  },

  async registerDeviceToken(token: string) {
    const { data } = await apiClient.post('/notifications/device-token', { token });
    return data;
  },

  async unregisterDeviceToken(token: string) {
    const { data } = await apiClient.delete('/notifications/device-token', { data: { token } });
    return data;
  },
};