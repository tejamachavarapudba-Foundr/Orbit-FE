import { PropsWithChildren } from "react";
import { View, ViewProps } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { getShadowStyle } from "@/theme/shadows";

type CardProps = ViewProps &
  PropsWithChildren<{
    elevated?: boolean;
    className?: string;
  }>;

export const Card = ({ children, elevated = false, className = "", style, ...props }: CardProps) => (
  <View
    className={`rounded-xl border border-border bg-card ${className}`}
    style={[getShadowStyle(elevated ? "elevated" : "card"), style]}
    {...props}
  >
    {children}
  </View>
);

type CardSectionProps = PropsWithChildren<{ className?: string }>;

export const CardHeader = ({ children, className = "" }: CardSectionProps) => (
  <View className={`flex-col gap-1.5 p-6 ${className}`}>{children}</View>
);

export const CardTitle = ({
  children,
  className = ""
}: PropsWithChildren<{ className?: string }>) => (
  <AppText family="display" weight="semibold" className={`leading-tight tracking-tight ${className}`}>
    {children}
  </AppText>
);

export const CardDescription = ({
  children,
  className = ""
}: PropsWithChildren<{ className?: string }>) => (
  <AppText tone="muted" size="sm" className={className}>
    {children}
  </AppText>
);

export const CardContent = ({ children, className = "" }: CardSectionProps) => (
  <View className={`px-6 pb-6 pt-0 ${className}`}>{children}</View>
);

export const CardFooter = ({ children, className = "" }: CardSectionProps) => (
  <View className={`flex-row items-center px-6 pb-6 pt-0 ${className}`}>{children}</View>
);
