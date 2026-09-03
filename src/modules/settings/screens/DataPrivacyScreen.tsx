import { ScrollView, View } from "react-native";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";

const sections = [
  {
    title: "What we collect",
    body: "Your profile details (name, headline, bio, role, skills, location), content you post or send (posts, comments, messages), and basic usage data needed to run the app (login sessions, device info for crash diagnostics)."
  },
  {
    title: "How it's used",
    body: "To run core features: showing your profile to other members, matching you with relevant people, delivering your posts and messages, and powering search and recommendations."
  },
  {
    title: "Who can see it",
    body: "Your public profile fields (name, headline, role, skills, bio) are visible to other Orbit members. Direct messages are only visible to you and the recipient. We don't sell your data to third parties."
  },
  {
    title: "Your controls",
    body: "You can edit or remove most profile information at any time from the Profile tab, and permanently delete your account and associated data from Profile → Delete account."
  },
  {
    title: "Data retention",
    body: "We keep your data while your account is active. Deleting your account removes your profile and content from the platform."
  }
];

export const DataPrivacyScreen = () => (
  <AppScreen>
    <AppHeader />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      <AppText family="display" size="2xl" weight="bold" className="mt-6">
        Data &amp; Privacy
      </AppText>
      <AppText tone="muted" size="sm" className="mt-2 leading-5">
        A plain-language summary of how Orbit handles your data.
      </AppText>

      <View className="mt-6 gap-4">
        {sections.map((section) => (
          <View key={section.title} className="gap-1.5 rounded-md border border-border bg-surface p-4">
            <AppText weight="bold">{section.title}</AppText>
            <AppText tone="muted" size="sm" className="leading-5">
              {section.body}
            </AppText>
          </View>
        ))}
      </View>
    </ScrollView>
  </AppScreen>
);
