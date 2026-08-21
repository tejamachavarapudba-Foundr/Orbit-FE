import { useState } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type ExpandableCaptionProps = {
  text: string;
};

// A pixel-perfect "does this truncate to 2 lines" check needs a native text
// measurement, which behaves inconsistently across iOS/Android. A character
// count is a reliable enough proxy for whether ~2 lines will be exceeded at
// this font size, and it's what most feed UIs actually use in practice.
const TRUNCATE_AT = 120;

export const ExpandableCaption = ({ text }: ExpandableCaptionProps) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > TRUNCATE_AT;

  if (!isLong) {
    return (
      <AppText size="sm" className="leading-relaxed">
        {text}
      </AppText>
    );
  }

  return (
    <View>
      <AppText size="sm" className="leading-relaxed" numberOfLines={expanded ? undefined : 2}>
        {text}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={() => setExpanded((current) => !current)}
        hitSlop={8}
        className="mt-1 self-start py-0.5"
      >
        <AppText size="sm" tone="muted" weight="semibold">
          {expanded ? "less" : "more"}
        </AppText>
      </Pressable>
    </View>
  );
};
