import { useState } from "react";
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
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="gap-2">
      <AppText size="sm" weight="medium">
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        onFocus={(event) => {
          setIsFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          props.onBlur?.(event);
        }}
        className={`h-9 rounded-md border bg-transparent px-3 text-sm text-text shadow-sm ${
          isFocused ? "border-ring" : "border-input"
        } ${error ? "border-danger" : ""} ${className}`}
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
