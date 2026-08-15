import { FlatList, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { AppButton } from '@/components/ui/AppButton';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { iconSize } from '@/theme/designTokens';

import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../hooks';

import { NotificationCard } from '../components/NotificationCard';
import { NotificationEmptyState } from '../components/NotificationEmptyState';

export const NotificationsScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const { data = [], isLoading } = useNotifications();

  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  return (
    <AppScreen>
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          className="h-9 w-9 items-center justify-center rounded-md"
        >
          <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
        </Pressable>
        <AppText size="2xl" weight="bold">
          Notifications
        </AppText>
        <AppButton label="Read All" size="sm" onPress={() => markAll.mutate()} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <NotificationCard notification={item} onPress={() => markRead.mutate(item.id)} />
        )}
        contentContainerStyle={{ gap: 12 }}
        ListEmptyComponent={!isLoading ? <NotificationEmptyState /> : null}
      />
    </AppScreen>
  );
};
