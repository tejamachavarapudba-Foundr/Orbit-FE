import { useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";

type AppTextInputProps = TextInputProps & {
  label?: string;
  required?: boolean | undefined;
  error?: string | undefined;
  className?: string;
};

export const AppTextInput = ({ label, required, error, className = "", ...props }: AppTextInputProps) => {
  const colors = useThemeTokens();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="gap-2">
      {label ? (
        <AppText size="sm" weight="medium">
          {label}
          {required ? <AppText tone="danger"> *</AppText> : null}
        </AppText>
      ) : null}
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
        className={`min-h-[44px] rounded-t-lg border-b-2 bg-surface-elevated px-3 py-2 text-sm leading-5 text-text ${
          isFocused ? "border-primary" : "border-input"
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
