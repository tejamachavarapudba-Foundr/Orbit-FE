import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import { Card, CardContent } from "@/components/ui/Card";
import { AppText } from "@/components/ui/AppText";

import { useThemeTokens } from "@/hooks/useThemeTokens";

import { MeetingRequestForm } from "./MeetingRequestForm";

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{
          backgroundColor: "rgba(0,0,0,0.55)",
        }}
      >
        <Pressable
          onPress={() => {}}
          className="max-h-[92%]"
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          > 
            <SafeAreaView style={{ flex: 1 }}>
              <Card
                className="rounded-t-3xl"
                style={{
                  maxHeight: "90%",
                }}
              >
                <CardContent className="p-5">

                  {/* Header */}

                  <View className="mb-5 flex-row items-center">

                    <View className="flex-1">

                      <AppText
                        size="xl"
                        weight="bold"
                      >
                        Book Meeting
                      </AppText>

                      <AppText
                        tone="muted"
                        size="sm"
                      >
                        {startupName
                          ? startupName
                          : "Startup"}
                      </AppText>

                    </View>

                    <Pressable
                      onPress={onClose}
                    >
                      <Feather
                        name="x"
                        size={22}
                        color={colors.text}
                      />
                    </Pressable>

                  </View>

                  {/* Form */}

                  <ScrollView
                    style={{ maxHeight: 600 }}
                    contentContainerStyle={{ paddingBottom: 30 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={
                      false
                    }
                  >
                    <MeetingRequestForm
                      startupId={startupId}
                      onCancel={onClose}
                      onSuccess={() => {
                        onClose();
                        onSuccess?.();                        
                      }}
                    />
                  </ScrollView>

                </CardContent>
              </Card>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};