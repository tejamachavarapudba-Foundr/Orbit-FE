import { useEffect, useRef } from 'react';
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
  useMarkNotificationsRead,
} from '../hooks';

import { NotificationCard } from '../components/NotificationCard';
import { NotificationEmptyState } from '../components/NotificationEmptyState';
import { BELL_EXCLUDED_TYPES } from '../categories';
import type { Notification } from '../types';

export const NotificationsScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const { data, isLoading } = useNotifications();
  const notifications: Notification[] = data ?? [];

  // Messages, projects, jobs, events and connection requests now have their
  // own badge elsewhere — this screen only shows (and only marks read) what
  // isn't already covered by one of those.
  const visible: Notification[] = notifications.filter((item) => !BELL_EXCLUDED_TYPES.has(item.type));

  const markRead = useMarkNotificationRead();
  const markVisibleRead = useMarkNotificationsRead();
  const hasAutoMarkedRef = useRef(false);

  // Clear the bell badge just by opening this screen, like most apps do,
  // instead of requiring an explicit tap on "Read All" or every item.
  useEffect(() => {
    if (hasAutoMarkedRef.current || isLoading) {
      return;
    }
    const unreadIds = visible.filter((item) => !item.isRead).map((item) => item.id);
    if (unreadIds.length > 0) {
      hasAutoMarkedRef.current = true;
      markVisibleRead.mutate(unreadIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, isLoading]);

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
        <AppButton
          label="Read All"
          size="sm"
          onPress={() => markVisibleRead.mutate(visible.filter((item) => !item.isRead).map((item) => item.id))}
        />
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={9}
        updateCellsBatchingPeriod={50}
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
