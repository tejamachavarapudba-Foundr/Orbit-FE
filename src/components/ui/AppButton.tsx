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
  default: "h-11 px-5",
  lg: "h-14 px-6",
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

const basePressableClass = "flex-row items-center justify-center gap-2 rounded-md border";

export const AppButton = ({
  label,
  loading = false,
  variant = "primary",
  size = "lg",
  leftIcon,
  rightIcon,
  disabled,
  className = "",
  style,
  ...props
}: AppButtonProps) => {
  const colors = useThemeTokens();
  const isDisabled = disabled || loading;
  const isIconOnly = size === "icon";
  const shadowPreset = variant === "primary" && !isIconOnly ? "glow" : "none";
  const spinnerColor =
    variant === "primary" || variant === "destructive" ? colors.onPrimary : colors.primary;

  const pressableClassName = [basePressableClass, variantClass[variant], sizeClass[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={pressableClassName}
      style={(state) => [
        getShadowStyle(shadowPreset),
        isDisabled ? { opacity: 0.5 } : undefined,
        typeof style === "function" ? style(state) : style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <>
          {leftIcon}
          {!isIconOnly ? (
            variant === "link" ? (
              <AppText weight="medium" size={labelSize[size]} tone={labelTone[variant]} className="underline">
                {label}
              </AppText>
            ) : (
              <AppText weight="medium" size={labelSize[size]} tone={labelTone[variant]}>
                {label}
              </AppText>
            )
          ) : null}
          {rightIcon}
        </>
      )}
    </Pressable>
  );
};
