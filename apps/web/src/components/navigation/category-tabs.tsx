import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import type { LucideIcon } from "lucide-react";

import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

type Category = {
  value: string;
  label: string;
  icon: LucideIcon;
};

type CategoryTabsProps = {
  categories: readonly Category[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

function CategoryTabs({
  categories,
  value,
  onValueChange,
  className,
}: Readonly<CategoryTabsProps>) {
  return (
    <RadioGroup
      aria-label="Catégories"
      value={value}
      onValueChange={(next) => onValueChange(next as string)}
      data-slot="category-tabs"
      className={cn(
        "-mb-px flex w-full gap-2 overflow-x-auto [contain:inline-size] [scrollbar-width:none] md:gap-6",
        className,
      )}
    >
      {categories.map(({ value: category, label, icon: Icon }) => (
        <Radio.Root
          key={category}
          value={category}
          className={cn(
            focusRing,
            "text-muted-foreground hover:text-foreground data-checked:border-primary data-checked:text-foreground flex shrink-0 cursor-pointer flex-col items-center gap-2 rounded-t-lg border-b-3 border-transparent px-3 pt-2 pb-3 text-xs font-bold transition-colors",
          )}
        >
          <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
          {label}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}

export { CategoryTabs };
