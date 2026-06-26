import { FlatList, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';

import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../hooks';

import { NotificationCard } from '../components/NotificationCard';

export const NotificationsScreen = () => {
  const { data = [], isLoading } =
    useNotifications();

  const markRead =
    useMarkNotificationRead();

  const markAll =
    useMarkAllNotificationsRead();

  return (
    <AppScreen>
      <View className="mb-4 flex-row justify-between">
        <AppText
          size="2xl"
          weight="bold"
        >
          Notifications
        </AppText>

        <AppButton
          label="Read All"
          onPress={() =>
            markAll.mutate()
          }
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() =>
              markRead.mutate(item.id)
            }
          />
        )}
        contentContainerStyle={{
          gap: 12,
        }}
      />
    </AppScreen>
  );
};