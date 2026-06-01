import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, View } from "react-native";

import { AuthStackParamList } from "@/app/navigation/types";
import { AppLogo } from "@/components/brand/AppLogo";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, "Welcome">;

const roles = ["Founder", "Co-Founder", "Engineer", "Mentor", "Investor"];

const features = [
  {
    title: "Find a co-founder",
    message: "Match with people whose skills complement yours and whose vision fits your next build."
  },
  {
    title: "Build your team",
    message: "Meet engineers, designers, operators, and startup specialists ready for early-stage work."
  },
  {
    title: "Meet investors",
    message: "Get on the radar of angels and backers actively looking at your stage and sector."
  }
] as const;

export const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => (
  <AppScreen>
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center justify-between pt-4">
        <AppLogo />
        <ThemeToggle />
      </View>

      <View className="mt-14 items-center">
        <View className="rounded-md border border-border bg-surface px-4 py-2 shadow-sm">
          <AppText size="sm" tone="muted">
            The collaboration network for startup builders
          </AppText>
        </View>

        <AppText size="2xl" weight="bold" className="mt-8 text-center">
          Where founders, builders and backers connect
        </AppText>
        <AppText tone="muted" className="mt-4 text-center leading-6">
          Find your co-founder, meet mentors, talk to investors, and build with people who care about the mission.
        </AppText>

        <View className="mt-8 w-full gap-3">
          <AppButton label="Join the network" onPress={() => navigation.navigate("Register")} />
          <AppButton label="Sign in" variant="outline" onPress={() => navigation.navigate("Login")} />
        </View>
      </View>

      <View className="mt-8 flex-row flex-wrap justify-center gap-2">
        {roles.map((role) => (
          <View key={role} className="rounded-md border border-border bg-surface px-3 py-2 shadow-sm">
            <AppText size="sm" tone="muted">
              {role}
            </AppText>
          </View>
        ))}
      </View>

      <View className="mt-8 gap-3 pb-8">
        {features.map((feature) => (
          <View key={feature.title} className="rounded-md border border-border bg-surface p-4 shadow-sm">
            <View className="mb-4 h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <AppLogo compact />
            </View>
            <AppText size="lg" weight="bold">
              {feature.title}
            </AppText>
            <AppText tone="muted" className="mt-2 leading-6">
              {feature.message}
            </AppText>
          </View>
        ))}
      </View>
    </ScrollView>
  </AppScreen>
);
