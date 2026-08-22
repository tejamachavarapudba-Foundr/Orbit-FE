import { View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useThemeTokens } from "@/hooks/useThemeTokens";

type VerifiedBadgeProps = {
  size?: "sm" | "md";
  className?: string;
};

const dimensions: Record<NonNullable<VerifiedBadgeProps["size"]>, { box: number; icon: number }> = {
  sm: { box: 14, icon: 10 },
  md: { box: 18, icon: 13 }
};

/** A small filled checkmark badge, meant to sit inline right after a verified user's name. */
export const VerifiedBadge = ({ size = "sm", className = "" }: VerifiedBadgeProps) => {
  const colors = useThemeTokens();
  const { box, icon } = dimensions[size];

  return (
    <View
      accessibilityLabel="Identity verified"
      className={`items-center justify-center rounded-full bg-primary ${className}`}
      style={{ width: box, height: box }}
    >
      <Feather name="check" size={icon} color={colors.onPrimary} />
    </View>
  );
};
