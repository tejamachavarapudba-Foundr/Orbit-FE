import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";

type PostComposerPromptProps = {
  onPress: () => void;
};

export const PostComposerPrompt = ({ onPress }: PostComposerPromptProps) => {
  const colors = useThemeTokens();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Create a new post"
    >
      <Card className="mb-5">
        <CardContent className="flex-row items-center gap-3 p-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Feather name="edit-3" size={18} color={colors.primary} />
          </View>
          <AppText tone="muted" size="sm" className="flex-1 leading-5">
            Share an update, milestone, ad, or announcement...
          </AppText>
          <Feather name="plus-circle" size={22} color={colors.primary} />
        </CardContent>
      </Card>
    </Pressable>
  );
};
