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
            "group/tab text-muted-foreground hover:text-foreground data-checked:text-foreground after:bg-primary after:ease-signature relative flex shrink-0 cursor-pointer flex-col items-center gap-2 rounded-t-lg px-3 pt-2 pb-3 text-xs font-bold transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:scale-x-0 after:transition-transform after:duration-300 data-checked:after:scale-x-100",
          )}
        >
          <Icon
            aria-hidden="true"
            className="ease-signature size-6 transition-transform duration-300 group-hover/tab:-translate-y-0.5"
            strokeWidth={1.75}
          />
          {label}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}

export { CategoryTabs };
