import type { LucideIcon } from "lucide-react";

import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

type Category<T extends string> = {
  value: T;
  label: string;
  icon: LucideIcon;
};

type CategoryTabsProps<T extends string> = {
  categories: readonly Category<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

function CategoryTabs<T extends string>({
  categories,
  value,
  onValueChange,
  className,
}: Readonly<CategoryTabsProps<T>>) {
  return (
    <div
      role="group"
      aria-label="Catégories"
      data-slot="category-tabs"
      className={cn(
        "flex w-full gap-2 overflow-x-auto [contain:inline-size] [scrollbar-width:none] md:gap-6",
        className,
      )}
    >
      {categories.map(({ value: category, label, icon: Icon }) => {
        const isActive = category === value;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isActive}
            onClick={() => {
              if (!isActive) onValueChange(category);
            }}
            className={cn(
              focusRing,
              "text-muted-foreground hover:text-foreground aria-pressed:border-foreground aria-pressed:text-foreground flex shrink-0 cursor-pointer flex-col items-center gap-2 rounded-t-lg border-b-2 border-transparent px-3 pt-2 pb-3 text-xs font-bold transition-colors",
            )}
          >
            <Icon className="size-6" strokeWidth={1.75} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export { CategoryTabs };
