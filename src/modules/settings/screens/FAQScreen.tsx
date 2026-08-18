import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";

const faqs = [
  {
    question: "How do matches work?",
    answer:
      "During onboarding you pick a role and goals. We use those, along with your profile, to suggest founders, investors, advisors, professionals, and service providers who are relevant to you."
  },
  {
    question: "What's the difference between following and connecting?",
    answer:
      "Following is one-way — you'll see their posts and updates. Connecting requires the other person to accept a request, and unlocks messaging between you both."
  },
  {
    question: "How do I save a post?",
    answer:
      "Tap the bookmark icon on any post in the feed. Saved posts show up under Settings → Saved."
  },
  {
    question: "Can I change my role after onboarding?",
    answer:
      "Yes — update your role and role-specific details anytime from the Profile tab."
  },
  {
    question: "How do I delete my account?",
    answer:
      "Go to Profile → Delete account. This permanently removes your profile and content and can't be undone."
  },
  {
    question: "Is Startuphouze free?",
    answer:
      "Yes, everything is currently free — see Settings → Subscription for details."
  }
];

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const colors = useThemeTokens();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="rounded-md border border-border bg-surface">
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsOpen((value) => !value)}
        className="flex-row items-center justify-between px-4 py-3.5"
      >
        <AppText weight="semibold" className="flex-1 pr-3">
          {question}
        </AppText>
        <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
      </Pressable>
      {isOpen ? (
        <AppText tone="muted" size="sm" className="px-4 pb-4 leading-5">
          {answer}
        </AppText>
      ) : null}
    </View>
  );
};

export const FAQScreen = () => (
  <AppScreen>
    <AppHeader />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      <AppText family="display" size="2xl" weight="bold" className="mt-6">
        FAQ
      </AppText>

      <View className="mt-6 gap-3">
        {faqs.map((item) => (
          <FaqItem key={item.question} question={item.question} answer={item.answer} />
        ))}
      </View>
    </ScrollView>
  </AppScreen>
);
