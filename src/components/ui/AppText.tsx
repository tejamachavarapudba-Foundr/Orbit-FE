import { Text, TextProps } from "react-native";

type AppTextProps = TextProps & {
  tone?: "default" | "muted" | "danger" | "primary" | "success" | "onPrimary";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl";
  weight?: "regular" | "medium" | "semibold" | "bold";
};

const toneClass = {
  default: "text-text",
  muted: "text-muted",
  danger: "text-danger",
  primary: "text-primary",
  success: "text-success",
  onPrimary: "text-onPrimary"
} as const;

const sizeClass = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl"
} as const;

const weightClass = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold"
} as const;

export const AppText = ({
  tone = "default",
  size = "base",
  weight = "regular",
  className = "",
  ...props
}: AppTextProps) => (
  <Text className={`${toneClass[tone]} ${sizeClass[size]} ${weightClass[weight]} ${className}`} {...props} />
);
