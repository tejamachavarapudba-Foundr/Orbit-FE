import React, { useCallback, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,   
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";

import { useThemeTokens } from "@/hooks/useThemeTokens";

import { MeetingRequestForm } from "./MeetingRequestForm";

// #region agent log
const DEBUG_LOG_HOST = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1";
const debugLog = (
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
  runId = "pre-fix",
) => {
  const payload = {
    sessionId: "1aa2f1",
    runId,
    hypothesisId,
    location,
    message,
    data: { platform: Platform.OS, ...data },
    timestamp: Date.now(),
  };
  console.warn("[DEBUG-1aa2f1]", JSON.stringify(payload));
  fetch(`http://${DEBUG_LOG_HOST}:7427/ingest/b69baca5-7169-4c15-b121-a6217c30cb9c`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "1aa2f1",
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
};
// #endregion

const SCREEN_HEIGHT = Dimensions.get("window").height;

type Props = {
  visible: boolean;

  startupId: string;

  startupName?: string;

  onClose: () => void;

  onSuccess?: () => void;
};

export const MeetingRequestModal = ({
  visible,
  startupId,
  startupName,
  onClose,
  onSuccess,
}: Props) => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const [formState, setFormState] = useState({
    canSubmit: false,
    isSubmitting: false,
    submit: () => {},
  });

  const formStateChangeCountRef = React.useRef(0);

  const handleFormSuccess = useCallback(() => {
    onClose();
    onSuccess?.();
  }, [onClose, onSuccess]);

  const handleFormStateChange = useCallback(
    (state: {
      canSubmit: boolean;
      isSubmitting: boolean;
      submit: () => void;
    }) => {
      formStateChangeCountRef.current += 1;
      // #region agent log
      debugLog("B", "MeetingRequestModal.tsx:handleFormStateChange", "parent setFormState", {
        callCount: formStateChangeCountRef.current,
        canSubmit: state.canSubmit,
        isSubmitting: state.isSubmitting,
      }, "post-fix");
      // #endregion
      setFormState((prev) => {
        if (
          prev.canSubmit === state.canSubmit &&
          prev.isSubmitting === state.isSubmitting &&
          prev.submit === state.submit
        ) {
          return prev;
        }
        return state;
      });
    },
    [],
  );

  // #region agent log
  const logLayout = useCallback(
    (layer: string, hypothesisId: string) =>
      (event: LayoutChangeEvent) => {
        const { width, height, x, y } = event.nativeEvent.layout;
        debugLog(hypothesisId, "MeetingRequestModal.tsx:onLayout", `layout:${layer}`, {
          layer,
          width,
          height,
          x,
          y,
          visible,
          startupIdPresent: Boolean(startupId),
        });
      },
    [visible, startupId],
  );

  React.useEffect(() => {
    if (visible) {
      debugLog("E", "MeetingRequestModal.tsx:useEffect", "modal opened", {
        startupIdPresent: Boolean(startupId),
        startupName: startupName ?? null,
      });
    }
  }, [visible, startupId, startupName]);
  // #endregion

  const sheetHeight = Math.round(SCREEN_HEIGHT * 0.92);
  const footerPaddingBottom = Math.max(insets.bottom, 16);

  const sheet = (
    <View
      style={{
        width: "100%",
        height: sheetHeight,
      }}
      onLayout={logLayout("sheet", "A")}
    >
      <Card
        className="rounded-t-3xl"
        style={{ height: "100%", flexDirection: "column" }}
        onLayout={logLayout("card", "A")}
      >
        <View className="flex-row items-center border-b border-border px-5 py-5">
          <View style={{ flex: 1 }}>
            <AppText size="xl" weight="bold">
              Book Meeting
            </AppText>
            <AppText tone="muted" size="sm">
              {startupName || "Startup"}
            </AppText>
          </View>

          <Pressable onPress={onClose} hitSlop={8}>
            <Feather name="x" size={22} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 12,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          nestedScrollEnabled
          onLayout={logLayout("scrollView", "B")}
        >
          <MeetingRequestForm
            startupId={startupId}
            showActions={false}
            onStateChange={handleFormStateChange}
            onCancel={onClose}
            onSuccess={handleFormSuccess}
          />
        </ScrollView>

        <View
          className="flex-row gap-3 border-t border-border px-5 pt-4"
          style={{ paddingBottom: footerPaddingBottom }}
          onLayout={logLayout("footer", "B")}
        >
          <AppButton
            label="Cancel"
            variant="outline"
            className="flex-1"
            onPress={onClose}
          />
          <AppButton
            label="Send Request"
            className="flex-1"
            loading={formState.isSubmitting}
            disabled={!formState.canSubmit}
            onPress={formState.submit}
          />
        </View>
      </Card>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={styles.overlay}
        onLayout={logLayout("backdrop", "D")}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={{ width: "100%" }}
          onLayout={logLayout("sheetContainer", "A")}
        >
          {Platform.OS === "ios" ? (
            <KeyboardAvoidingView
              behavior="padding"
              onLayout={logLayout("keyboardAvoidingView", "B")}
            >
              {sheet}
            </KeyboardAvoidingView>
          ) : (
            sheet
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
});
