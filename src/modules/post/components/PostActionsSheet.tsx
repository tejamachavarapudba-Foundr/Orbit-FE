import { ElementRef, useCallback, useEffect, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView, TouchableOpacity } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { usePostActionsSheetStore } from "@/modules/post/postActionsSheetStore";

// Rendered once near the app root (see App.tsx) so opening it never nests a
// modal inside a scrolling FlatList row — that's what made the old per-post
// "..." menu misbehave on Android. Every PostCard just calls
// usePostActionsSheetStore.getState().open(actions) to use this same sheet.
export const PostActionsSheet = () => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<ElementRef<typeof BottomSheetModal>>(null);
  const isOpen = usePostActionsSheetStore((state) => state.isOpen);
  const actions = usePostActionsSheetStore((state) => state.actions);
  const close = usePostActionsSheetStore((state) => state.close);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      onDismiss={close}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetView style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        {actions.map((action) => (
          // TouchableOpacity here is @gorhom/bottom-sheet's own re-export
          // (backed by react-native-gesture-handler on Android), not RN's —
          // a plain RN Pressable's touch responder loses to the sheet's own
          // pan-to-dismiss gesture handler, so taps on these rows never fired.
          <TouchableOpacity
            key={action.label}
            accessibilityRole="button"
            onPress={() => {
              close();
              action.onPress();
            }}
            style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 24, paddingVertical: 14 }}
          >
            <Feather name={action.icon} size={20} color={action.destructive ? colors.danger : colors.text} />
            <AppText size="base" tone={action.destructive ? "danger" : "default"}>
              {action.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </BottomSheetView>
    </BottomSheetModal>
  );
};
