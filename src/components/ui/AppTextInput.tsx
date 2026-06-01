import { TextInput, TextInputProps, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";

type AppTextInputProps = TextInputProps & {
  label: string;
  error?: string | undefined;
  className?: string;
};

export const AppTextInput = ({ label, error, className = "", ...props }: AppTextInputProps) => {
  const colors = useThemeTokens();

  return (
    <View className="gap-2">
      <AppText size="sm" weight="medium">
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        className={`h-14 rounded-md border border-border bg-surface px-4 text-base text-text shadow-sm ${className}`}
        {...props}
      />
      {error ? (
        <AppText tone="danger" size="sm">
          {error}
        </AppText>
      ) : null}
    </View>
  );
};
