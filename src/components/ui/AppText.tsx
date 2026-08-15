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

// React Native ignores `fontWeight` on custom (non-system) fonts, so each
// weight has to map to a distinct loaded font file rather than a CSS weight.
const fontFamilyClass = {
  body: {
    regular: "font-sans",
    medium: "font-sans-medium",
    semibold: "font-sans-semibold",
    bold: "font-sans-bold"
  },
  display: {
    regular: "font-display",
    medium: "font-display-semibold",
    semibold: "font-display-semibold",
    bold: "font-display-bold"
  }
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
    className={`${fontFamilyClass[family][weight]} ${toneClass[tone]} ${sizeClass[size]} ${className}`}
    {...props}
  />
);
