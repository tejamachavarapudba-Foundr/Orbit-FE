import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

type ScreenHeaderProps = {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  className?: string;
};

/**
 * Consistent back-button header used across stack-pushed screens (as opposed
 * to the bottom-tab screens, which use AppHeader). Falls back to
 * navigation.goBack() when no onBack is supplied.
 */
export const ScreenHeader = ({ title, onBack, right, className = "" }: ScreenHeaderProps) => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();

  return (
    <View className={`flex-row items-center gap-3 pb-3 pt-2 ${className}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={() => (onBack ? onBack() : navigation.goBack())}
        className="h-9 w-9 items-center justify-center rounded-full bg-muted-bg"
      >
        <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
      </Pressable>
      {title ? (
        <AppText weight="bold" size="lg" className="min-w-0 flex-1" numberOfLines={1}>
          {title}
        </AppText>
      ) : (
        <View className="flex-1" />
      )}
      {right}
    </View>
  );
};
