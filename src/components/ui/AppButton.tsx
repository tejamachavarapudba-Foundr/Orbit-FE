import { ActivityIndicator, Pressable, PressableProps } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";

type AppButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
};

const variantClass = {
  primary: "bg-primary border-primary",
  ghost: "bg-transparent border-transparent",
  outline: "bg-transparent border-border"
} as const;

const labelTone = {
  primary: "onPrimary",
  ghost: "text-primary",
  outline: "text-primary"
} as const;

export const AppButton = ({
  label,
  loading = false,
  variant = "primary",
  disabled,
  className = "",
  ...props
}: AppButtonProps) => {
  const colors = useThemeTokens();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`h-12 items-center justify-center rounded-md border px-4 ${variantClass[variant]} ${
        isDisabled ? "opacity-60" : "opacity-100"
      } ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.onPrimary : colors.primary} />
      ) : (
        <AppText weight="semibold" tone={variant === "primary" ? labelTone.primary : "primary"}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
};
