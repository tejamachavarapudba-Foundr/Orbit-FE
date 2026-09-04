import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { ProjectComposer } from "@/modules/project/components/ProjectComposer";
import { iconSize } from "@/theme/designTokens";
import { MainStackParamList } from "@/app/navigation/types";

export const CreateProjectScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <AppScreen withHorizontalPadding={false}>
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          className="h-9 w-9 items-center justify-center rounded-md"
        >
          <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
        </Pressable>
        <AppText weight="bold" size="lg">
          New project
        </AppText>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 160 }}
          keyboardShouldPersistTaps="handled"
        >
          <ProjectComposer autoExpanded onDone={() => navigation.goBack()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
};
