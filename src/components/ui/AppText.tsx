import { Text, TextProps } from "react-native";

type AppTextProps = TextProps & {
  tone?: "default" | "muted" | "danger" | "primary" | "success" | "onPrimary";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  weight?: "regular" | "medium" | "semibold" | "bold";
  family?: "body" | "display";
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
  "2xl": "text-2xl",
  "3xl": "text-3xl"
} as const;

const weightClass = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold"
} as const;

const familyClass = {
  body: "font-sans",
  display: "font-display"
} as const;

export const AppText = ({
  tone = "default",
  size = "base",
  weight = "regular",
  family = "body",
  className = "",
  ...props
}: AppTextProps) => (
  <Text
    className={`${familyClass[family]} ${toneClass[tone]} ${sizeClass[size]} ${weightClass[weight]} ${className}`}
    {...props}
  />
);
