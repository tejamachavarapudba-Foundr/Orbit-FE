import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { useInvestorSnapshot } from "../hooks";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Card, CardContent } from "@/components/ui/Card";
import { ScreenHeader } from "@/components/layout/ScreenHeader";

export const BusinessSummaryScreen = () => {
  const [targetCustomers, setTargetCustomers] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [revenueStreams, setRevenueStreams] = useState("");
  const [marketOpportunity, setMarketOpportunity] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [solutionSummary, setSolutionSummary] = useState("");
  const [startupVision, setStartupVision] = useState("");
  
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { projectId } = route.params;

  const {
    snapshot,
    loadSnapshot,
    updateSnapshot,
    isSaving,
  } = useInvestorSnapshot();
  
  useEffect(() => {
    if (projectId) {
      loadSnapshot(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (!snapshot) return;
  
    setTargetCustomers(snapshot.targetCustomers || "");
    setBusinessModel(snapshot.businessModel || "");
    setRevenueStreams(snapshot.revenueStreams || "");
    setMarketOpportunity(snapshot.marketOpportunity || "");
    setProblemStatement(snapshot.problemStatement || "");
    setSolutionSummary(snapshot.solutionSummary || "");
    setStartupVision(snapshot.startupVision || "");
  }, [snapshot]);
  
  const handleContinue = async () => {
    
    const success = await updateSnapshot(
      projectId,
      {
        targetCustomers,
        businessModel,
        revenueStreams,
        marketOpportunity,
        problemStatement,
        solutionSummary,
        startupVision,
        completionPercentage: 20,
      }
    );
  
    if (success) {
      navigation.navigate(
        "Traction" as never,
        {
          projectId,
        } as never
      );
    }
  };

  return (
    <AppScreen withHorizontalPadding={false}>
      <ScreenHeader title="Business Summary" className="px-4" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
      >
      <Card>
        <CardContent className="p-4">

          <AppText
            family="display"
            weight="bold"
            size="xl"
          >
            Investor Snapshot
          </AppText>

          <AppText
            tone="muted"
            size="sm"
            className="mt-1"
          >
            Step 1 of 5
          </AppText>

          <View className="mt-4">
            <AppText weight="semibold">
              {snapshot?.completionPercentage ?? 0}% Complete
            </AppText>
          </View>

          <AppText
            weight="bold"
            className="mt-6"
          >
            Business Summary
          </AppText>

          <View className="mt-4 gap-4">

            <AppTextInput
              label="Target Customers"
              value={targetCustomers}
              onChangeText={setTargetCustomers}
            />

            <AppTextInput
              label="Business Model"
              value={businessModel}
              onChangeText={setBusinessModel}
            />

            <AppTextInput
              label="Revenue Streams"
              value={revenueStreams}
              onChangeText={setRevenueStreams}
            />

            <AppTextInput
              label="Market Opportunity"
              value={marketOpportunity}
              onChangeText={setMarketOpportunity}
            />

            <AppTextInput
              label="Problem Statement"
              value={problemStatement}
              onChangeText={setProblemStatement}
              multiline
            />

            <AppTextInput
              label="Solution Summary"
              value={solutionSummary}
              onChangeText={setSolutionSummary}
              multiline
            />

            <AppTextInput
              label="Startup Vision"
              value={startupVision}
              onChangeText={setStartupVision}
              multiline
            />

          </View>

          <View className="mt-6 flex-row gap-3">

            <AppButton
              label="Save Draft"
              variant="outline"
              className="flex-1"
              onPress={async () => {
                const success = await updateSnapshot(
                  projectId,
                  {
                    targetCustomers,
                    businessModel,
                    revenueStreams,
                    marketOpportunity,
                    problemStatement,
                    solutionSummary,
                    startupVision,
                  }
                );

                if (success) {
                    navigation.navigate("Tabs", {
                    screen: "Projects"});
                }   
              }}
            />

            <AppButton
              label="Continue"
              className="flex-1"
              loading={isSaving}
              onPress={() => void handleContinue()}
            />

          </View>

        </CardContent>
      </Card>
      </ScrollView>
    </AppScreen>
  );
};