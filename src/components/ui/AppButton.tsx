import { ReactNode } from "react";
import { ActivityIndicator, Pressable, PressableProps } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { getShadowStyle } from "@/theme/shadows";

type ButtonVariant = "primary" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "sm" | "default" | "lg" | "icon";

type AppButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "border-primary bg-primary",
  destructive: "border-danger bg-danger",
  outline: "border-border bg-background",
  secondary: "border-secondary bg-secondary",
  ghost: "border-transparent bg-transparent",
  link: "border-transparent bg-transparent"
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-8 px-3",
  default: "h-9 px-4",
  lg: "h-12 px-4",
  icon: "h-9 w-9 px-0"
};

const labelTone: Record<ButtonVariant, "onPrimary" | "primary" | "default"> = {
  primary: "onPrimary",
  destructive: "onPrimary",
  outline: "primary",
  secondary: "default",
  ghost: "primary",
  link: "primary"
};

const labelSize: Record<ButtonSize, "xs" | "sm" | "base"> = {
  sm: "xs",
  default: "sm",
  lg: "base",
  icon: "sm"
};

export const AppButton = ({
  label,
  loading = false,
  variant = "primary",
  size = "lg",
  leftIcon,
  rightIcon,
  disabled,
  className = "",
  ...props
}: AppButtonProps) => {
  const colors = useThemeTokens();
  const isDisabled = disabled || loading;
  const isIconOnly = size === "icon";
  const shadowPreset = variant === "primary" && !isIconOnly ? "glow" : "none";
  const spinnerColor =
    variant === "primary" || variant === "destructive" ? colors.onPrimary : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 rounded-md border ${variantClass[variant]} ${sizeClass[size]} ${
        isDisabled ? "opacity-50" : "opacity-100"
      } ${className}`}
      style={getShadowStyle(shadowPreset)}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <>
          {leftIcon}
          {!isIconOnly ? (
            <AppText
              weight="medium"
              size={labelSize[size]}
              tone={labelTone[variant]}
              className={variant === "link" ? "underline" : ""}
            >
              {label}
            </AppText>
          ) : null}
          {rightIcon}
        </>
      )}
    </Pressable>
  );
};
