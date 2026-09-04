import { useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";

type AppTextInputProps = TextInputProps & {
  label?: string | undefined;
  required?: boolean | undefined;
  error?: string | undefined;
  className?: string;
  rightElement?: React.ReactNode;
};

export const AppTextInput = ({ label, required, error, className = "", rightElement, ...props }: AppTextInputProps) => {
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
      <View className="relative justify-center">
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
          } ${error ? "border-danger" : ""} ${rightElement ? "pr-11" : ""} ${className}`}
          {...props}
        />
        {rightElement ? <View className="absolute right-2">{rightElement}</View> : null}
      </View>
      {error ? (
        <AppText tone="danger" size="sm">
          {error}
        </AppText>
      ) : null}
    </View>
  );
};
