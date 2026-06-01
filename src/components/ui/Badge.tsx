import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { BadgeCategory, categoryBadgeClass, categoryBadgeTextClass } from "@/theme/designTokens";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  category?: BadgeCategory;
  className?: string;
};

const variantClass: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary",
  secondary: "border-transparent bg-secondary",
  destructive: "border-transparent bg-danger",
  outline: "border-border bg-transparent"
};

const variantTextClass: Record<BadgeVariant, string> = {
  default: "text-onPrimary",
  secondary: "text-secondary-foreground",
  destructive: "text-danger-foreground",
  outline: "text-foreground"
};

export const Badge = ({ label, variant = "outline", category, className = "" }: BadgeProps) => {
  const categoryClass = category ? categoryBadgeClass[category] : "";
  const categoryTextClass = category ? categoryBadgeTextClass[category] : "";
  const useCategory = Boolean(category);

  return (
    <View
      className={`rounded-md border px-2.5 py-0.5 ${useCategory ? categoryClass : variantClass[variant]} ${className}`}
    >
      <AppText
        size="xs"
        weight="semibold"
        className={useCategory ? categoryTextClass : variantTextClass[variant]}
      >
        {label}
      </AppText>
    </View>
  );
};
