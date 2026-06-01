import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ScrollView, View } from "react-native";

import { AuthStackParamList } from "@/app/navigation/types";
import { AppLogo } from "@/components/brand/AppLogo";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { getShadowStyle } from "@/theme/shadows";

type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, "Welcome">;

const roles = [
  "Founder",
  "Co-Founder",
  "Software Engineer",
  "Mentor",
  "Policy Maker",
  "Investor",
  "Designer"
] as const;

const features = [
  {
    icon: "send" as const,
    title: "Find a co-founder",
    description:
      "Match with people whose skills complement yours and whose vision rhymes with yours."
  },
  {
    icon: "users" as const,
    title: "Build your team",
    description: "Hire (or get hired by) engineers, designers and PMs who love early-stage chaos."
  },
  {
    icon: "zap" as const,
    title: "Talk to mentors",
    description: "Tap operators who've been there — and policy makers who shape the rules."
  },
  {
    icon: "trending-up" as const,
    title: "Meet investors",
    description: "Get on the radar of angels and VCs actively looking at your stage and sector."
  },
  {
    icon: "shield" as const,
    title: "Real profiles",
    description: "Verified humans, clear roles, and explicit signals about what each person is open to."
  },
  {
    icon: "compass" as const,
    title: "Curated discovery",
    description: "Filter by role, skills, and what people are looking for — not endless feeds."
  }
] as const;

export const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const colors = useThemeTokens();

  return (
    <AppScreen withHorizontalPadding={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="pb-12">
        <View className="flex-row items-center justify-between px-4 pt-4">
          <AppLogo />
          <ThemeToggle />
        </View>

        <View className="overflow-hidden bg-primary-muted/40 px-4 pb-12 pt-10">
          <View className="items-center">
            <View
              className="mb-6 flex-row items-center gap-2 rounded-full border border-border bg-surface-elevated px-4 py-1.5 shadow-sm"
              style={getShadowStyle("card")}
            >
              <View className="h-1.5 w-1.5 rounded-full bg-success" />
              <AppText size="xs" weight="medium" tone="muted">
                The collaboration network for startup builders
              </AppText>
            </View>

            <AppText family="display" size="2xl" weight="bold" className="text-center tracking-tight">
              Where founders, builders &{" "}
              <AppText family="display" size="2xl" weight="bold" tone="primary">
                backers connect
              </AppText>
            </AppText>

            <AppText tone="muted" size="base" className="mt-6 max-w-md text-center leading-6">
              Foundr is a focused network for the startup ecosystem — find your co-founder, meet mentors, talk to
              investors, and build with engineers who care about the mission.
            </AppText>

            <View className="mt-10 w-full max-w-md gap-3">
              <AppButton label="Join the network" onPress={() => navigation.navigate("Register")} />
              <AppButton label="Sign in" variant="outline" onPress={() => navigation.navigate("Login")} />
              <AppButton
                label="Browse members"
                variant="outline"
                leftIcon={<Feather name="compass" size={16} color={colors.primary} />}
                onPress={() => navigation.navigate("Login")}
              />
            </View>

            <View className="mt-10 flex-row flex-wrap justify-center gap-2">
              {roles.map((role) => (
                <View
                  key={role}
                  className="rounded-full border border-border bg-surface-elevated px-3 py-1"
                  style={getShadowStyle("card")}
                >
                  <AppText size="xs" weight="medium" tone="muted">
                    {role}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="px-4 pt-16">
          <View className="items-center">
            <AppText family="display" size="xl" weight="bold" className="text-center tracking-tight">
              One network. Every role that builds startups.
            </AppText>
            <AppText tone="muted" className="mt-3 text-center leading-6">
              Skip the noise of generic professional networks. Foundr is purpose-built for early-stage collaboration.
            </AppText>
          </View>

          <View className="mt-10 gap-5">
            {features.map((feature) => (
              <Card key={feature.title} className="rounded-2xl p-6">
                <View className="mb-4 h-10 w-10 items-center justify-center rounded-xl bg-primary-muted">
                  <Feather name={feature.icon} size={20} color={colors.primary} />
                </View>
                <AppText family="display" size="lg" weight="semibold">
                  {feature.title}
                </AppText>
                <AppText tone="muted" size="sm" className="mt-1.5 leading-relaxed">
                  {feature.description}
                </AppText>
              </Card>
            ))}
          </View>
        </View>

        <View className="mx-4 mt-12 overflow-hidden rounded-3xl border border-border bg-primary px-8 py-14" style={getShadowStyle("elevated")}>
          <View className="items-center">
            <AppText family="display" size="xl" weight="bold" tone="onPrimary" className="text-center tracking-tight">
              Your next co-founder is one intro away.
            </AppText>
            <AppText size="sm" className="mt-3 text-center text-onPrimary/80">
              Create a profile in under a minute. It's free.
            </AppText>
            <AppButton
              label="Create your profile"
              variant="secondary"
              className="mt-7 w-full max-w-xs"
              onPress={() => navigation.navigate("Register")}
            />
          </View>
        </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
};
