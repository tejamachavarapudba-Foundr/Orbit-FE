export function NotificationEmptyState() {
    return (
      <View className="items-center py-20">
        <AppText size="lg" weight="bold">
          No notifications
        </AppText>
  
        <AppText
          tone="muted"
          className="mt-2 text-center"
        >
          We'll notify you about messages,
          applications, meetings, and
          startup activity.
        </AppText>
      </View>
    );
  }