import { Dropdown } from "@/components/ui/Dropdown";

type CategoryOption<T extends string> = {
  label: string;
  value: T;
};

type CategoryDropdownProps<T extends string> = {
  value: T;
  options: CategoryOption<T>[];
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  className?: string;
};

export const CategoryDropdown = <T extends string>(props: CategoryDropdownProps<T>) => (
  <Dropdown {...props} accessibilityLabel={props.accessibilityLabel ?? "Select category"} />
);
