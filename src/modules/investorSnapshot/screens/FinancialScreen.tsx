import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Card, CardContent } from "@/components/ui/Card";

import { useInvestorSnapshot } from "../hooks";

export const FinancialScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { projectId } = route.params;

  const {
    snapshot,
    loadSnapshot,
    updateSnapshot,
    isSaving,
  } = useInvestorSnapshot();

  const [mrr, setMrr] = useState("");
  const [arr, setArr] = useState("");

  const [cashBalance, setCashBalance] = useState("");
  const [burnRate, setBurnRate] = useState("");
  const [runwayMonths, setRunwayMonths] = useState("");

  const [grossMargin, setGrossMargin] = useState("");

  const [cac, setCac] = useState("");
  const [ltv, setLtv] = useState("");
  const [ltvCacRatio, setLtvCacRatio] = useState("");

  const [churnRate, setChurnRate] = useState("");

  const [ebitda, setEbitda] = useState("");
  const [ebitdaPercent, setEbitdaPercent] = useState("");

  useEffect(() => {
    if (projectId) {
      loadSnapshot(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (!snapshot) return;

    setMrr(snapshot.mrr?.toString() || "");
    setArr(snapshot.arr?.toString() || "");

    setCashBalance(snapshot.cashBalance?.toString() || "");
    setBurnRate(snapshot.burnRate?.toString() || "");
    setRunwayMonths(snapshot.runwayMonths?.toString() || "");

    setGrossMargin(snapshot.grossMargin?.toString() || "");

    setCac(snapshot.cac?.toString() || "");
    setLtv(snapshot.ltv?.toString() || "");
    setLtvCacRatio(snapshot.ltvCacRatio?.toString() || "");

    setChurnRate(snapshot.churnRate?.toString() || "");

    setEbitda(snapshot.ebitda?.toString() || "");
    setEbitdaPercent(snapshot.ebitdaPercent?.toString() || "");
  }, [snapshot]);

  useEffect(() => {
    const ltvValue = Number(ltv);
    const cacValue = Number(cac);

    if (ltvValue > 0 && cacValue > 0) {
      setLtvCacRatio(
        (ltvValue / cacValue).toFixed(2)
      );
    }
  }, [ltv, cac]);

  const saveDraft = async () => {
    await updateSnapshot(projectId, {
      mrr: Number(mrr) || 0,
      arr: Number(arr) || 0,

      cashBalance: Number(cashBalance) || 0,
      burnRate: Number(burnRate) || 0,
      runwayMonths: Number(runwayMonths) || 0,

      grossMargin: Number(grossMargin) || 0,

      cac: Number(cac) || 0,
      ltv: Number(ltv) || 0,
      ltvCacRatio: Number(ltvCacRatio) || 0,

      churnRate: Number(churnRate) || 0,

      ebitda: Number(ebitda) || 0,
      ebitdaPercent: Number(ebitdaPercent) || 0,
    });
  };

  const handleContinue = async () => {
    const success = await updateSnapshot(projectId, {
      mrr: Number(mrr) || 0,
      arr: Number(arr) || 0,

      cashBalance: Number(cashBalance) || 0,
      burnRate: Number(burnRate) || 0,
      runwayMonths: Number(runwayMonths) || 0,

      grossMargin: Number(grossMargin) || 0,

      cac: Number(cac) || 0,
      ltv: Number(ltv) || 0,
      ltvCacRatio: Number(ltvCacRatio) || 0,

      churnRate: Number(churnRate) || 0,

      ebitda: Number(ebitda) || 0,
      ebitdaPercent: Number(ebitdaPercent) || 0,

      completionPercentage: 75,
    });

    if (!success) return;

    navigation.navigate("Ownership", {
      projectId,
    });
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16 }}
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
            Step 3 of 4
          </AppText>

          <View className="mt-4">
            <AppText weight="semibold">
              {snapshot?.completionPercentage ?? 50}% Complete
            </AppText>
          </View>

          <AppText
            weight="bold"
            className="mt-6"
          >
            Financial Snapshot
          </AppText>

          <View className="mt-4 gap-4">

            <AppTextInput
              label="Monthly Revenue (MRR)"
              value={mrr}
              onChangeText={setMrr}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Annual Revenue (ARR)"
              value={arr}
              onChangeText={setArr}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Cash Balance"
              value={cashBalance}
              onChangeText={setCashBalance}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Monthly Burn Rate"
              value={burnRate}
              onChangeText={setBurnRate}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Runway Remaining (Months)"
              value={runwayMonths}
              onChangeText={setRunwayMonths}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Gross Margin (%)"
              value={grossMargin}
              onChangeText={setGrossMargin}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Customer Acquisition Cost (CAC)"
              value={cac}
              onChangeText={setCac}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Customer Lifetime Value (LTV)"
              value={ltv}
              onChangeText={setLtv}
              keyboardType="numeric"
            />

            <AppTextInput
              label="LTV : CAC Ratio"
              value={ltvCacRatio}
              editable={false}
            />

            <AppTextInput
              label="Customer Churn Rate (%)"
              value={churnRate}
              onChangeText={setChurnRate}
              keyboardType="numeric"
            />

            <AppTextInput
              label="EBITDA"
              value={ebitda}
              onChangeText={setEbitda}
              keyboardType="numeric"
            />

            <AppTextInput
              label="EBITDA Margin (%)"
              value={ebitdaPercent}
              onChangeText={setEbitdaPercent}
              keyboardType="numeric"
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
                      mrr: Number(mrr) || 0,
                      arr: Number(arr) || 0,
                      cashBalance: Number(cashBalance) || 0,
                      burnRate: Number(burnRate) || 0,
                      runwayMonths: Number(runwayMonths) || 0,
                      grossMargin: Number(grossMargin) || 0,
                      cac: Number(cac) || 0,
                      ltv: Number(ltv) || 0,
                      ltvCacRatio: Number(ltvCacRatio) || 0,
                      churnRate: Number(churnRate) || 0,
                      ebitda: Number(ebitda) || 0,
                      ebitdaPercent: Number(ebitdaPercent) || 0,
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
  );
};