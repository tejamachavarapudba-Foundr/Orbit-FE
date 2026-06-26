import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Card, CardContent } from "@/components/ui/Card";

import { useInvestorSnapshot } from "../hooks";

export const TractionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { projectId } = route.params;

  const {
    snapshot,
    loadSnapshot,
    updateSnapshot,
    isSaving,
  } = useInvestorSnapshot();

  const [totalUsers, setTotalUsers] = useState("");
  const [activeUsers, setActiveUsers] = useState("");
  const [payingCustomers, setPayingCustomers] = useState("");
  const [enterpriseCustomers, setEnterpriseCustomers] = useState("");

  const [customerGrowthRate, setCustomerGrowthRate] = useState("");
  const [revenueGrowthRate, setRevenueGrowthRate] = useState("");

  const [keyPartnerships, setKeyPartnerships] = useState("");
  const [majorAchievements, setMajorAchievements] = useState("");

  useEffect(() => {
    if (projectId) {
      loadSnapshot(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (!snapshot) return;

    setTotalUsers(snapshot.totalUsers?.toString() || "");
    setActiveUsers(snapshot.activeUsers?.toString() || "");
    setPayingCustomers(snapshot.payingCustomers?.toString() || "");
    setEnterpriseCustomers(snapshot.enterpriseCustomers?.toString() || "");

    setCustomerGrowthRate(
      snapshot.customerGrowthRate?.toString() || ""
    );

    setRevenueGrowthRate(
      snapshot.revenueGrowthRate?.toString() || ""
    );

    setKeyPartnerships(snapshot.keyPartnerships || "");
    setMajorAchievements(snapshot.majorAchievements || "");
  }, [snapshot]);

  const saveDraft = async () => {
    await updateSnapshot(projectId, {
      totalUsers: Number(totalUsers) || 0,
      activeUsers: Number(activeUsers) || 0,
      payingCustomers: Number(payingCustomers) || 0,
      enterpriseCustomers:
        Number(enterpriseCustomers) || 0,

      customerGrowthRate:
        Number(customerGrowthRate) || 0,

      revenueGrowthRate:
        Number(revenueGrowthRate) || 0,

      keyPartnerships,
      majorAchievements,
    });
  };

  const handleContinue = async () => {
    const success = await updateSnapshot(projectId, {
      totalUsers: Number(totalUsers) || 0,
      activeUsers: Number(activeUsers) || 0,
      payingCustomers: Number(payingCustomers) || 0,
      enterpriseCustomers:
        Number(enterpriseCustomers) || 0,

      customerGrowthRate:
        Number(customerGrowthRate) || 0,

      revenueGrowthRate:
        Number(revenueGrowthRate) || 0,

      keyPartnerships,
      majorAchievements,

      completionPercentage: 40,
    });

    if (!success) return;

    navigation.navigate("Financial", {
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
            Step 2 of 5
          </AppText>

          <View className="mt-4">
            <AppText weight="semibold">
              {snapshot?.completionPercentage ?? 20}% Complete
            </AppText>
          </View>

          <AppText
            weight="bold"
            className="mt-6"
          >
            Traction Summary
          </AppText>

          <View className="mt-4 gap-4">

            <AppTextInput
              label="Total Users"
              value={totalUsers}
              onChangeText={setTotalUsers}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Active Users"
              value={activeUsers}
              onChangeText={setActiveUsers}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Paying Customers"
              value={payingCustomers}
              onChangeText={setPayingCustomers}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Enterprise Customers"
              value={enterpriseCustomers}
              onChangeText={setEnterpriseCustomers}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Customer Growth Rate (%)"
              value={customerGrowthRate}
              onChangeText={setCustomerGrowthRate}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Revenue Growth Rate (%)"
              value={revenueGrowthRate}
              onChangeText={setRevenueGrowthRate}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Key Partnerships"
              value={keyPartnerships}
              onChangeText={setKeyPartnerships}
              multiline
            />

            <AppTextInput
              label="Major Achievements"
              value={majorAchievements}
              onChangeText={setMajorAchievements}
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
                    totalUsers: Number(totalUsers) || 0,
                    activeUsers: Number(activeUsers) || 0,
                    payingCustomers: Number(payingCustomers) || 0,
                    enterpriseCustomers: Number(enterpriseCustomers) || 0,
                    customerGrowthRate: Number(customerGrowthRate) || 0,
                    revenueGrowthRate: Number(revenueGrowthRate) || 0,
                    keyPartnerships,
                    majorAchievements,
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