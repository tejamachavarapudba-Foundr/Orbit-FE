import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { EmptyState } from "@/components/ui/EmptyState";

type PlaceholderTabScreenProps = {
  title: string;
  message: string;
};

export const PlaceholderTabScreen = ({ title, message }: PlaceholderTabScreenProps) => (
  <AppScreen withHorizontalPadding={false}>
    <AppHeader />
    <EmptyState title={title} message={message} />
  </AppScreen>
);
