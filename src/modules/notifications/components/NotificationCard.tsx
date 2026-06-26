import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Notification } from '../types';

interface Props {
  notification: Notification;
  onPress: () => void;
}

export const NotificationCard = ({
  notification,
  onPress,
}: Props) => {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-xl border p-4 ${
        notification.isRead
          ? 'border-border'
          : 'border-primary'
      }`}
    >
      <View className="gap-1">
        <AppText weight="bold">
          {notification.title}
        </AppText>

        <AppText size="sm">
          {notification.message}
        </AppText>

        <AppText size="xs" tone="muted">
          {new Date(
            notification.createdAt,
          ).toLocaleString()}
        </AppText>
      </View>
    </Pressable>
  );
};