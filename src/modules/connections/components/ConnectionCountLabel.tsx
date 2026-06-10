import { AppText } from "@/components/ui/AppText";
import { useConnectionCount } from "@/modules/connections/hooks";

type ConnectionCountLabelProps = {
  userId: string;
  className?: string;
};

export const ConnectionCountLabel = ({ userId, className }: ConnectionCountLabelProps) => {
  const count = useConnectionCount(userId);

  if (count === undefined) {
    return null;
  }

  const label = count === 1 ? "1 connection" : `${count} connections`;

  if (className) {
    return (
      <AppText tone="muted" size="sm" className={className}>
        {label}
      </AppText>
    );
  }

  return (
    <AppText tone="muted" size="sm">
      {label}
    </AppText>
  );
};
