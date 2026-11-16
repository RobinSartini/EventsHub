import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type SelectProps<T extends string> = {
  label: string;
  options: readonly SelectOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

function Select<T extends string>({
  label,
  options,
  value,
  onValueChange,
  className,
}: Readonly<SelectProps<T>>) {
  return (
    <SelectPrimitive.Root
      items={options}
      value={value}
      onValueChange={(selected) => {
        if (selected !== null) onValueChange(selected);
      }}
    >
      <SelectPrimitive.Trigger
        aria-label={label}
        data-slot="select"
        className={cn(
          focusRing,
          "bg-card border-border inline-flex h-[46px] cursor-pointer items-center gap-2 rounded-full border-2 pr-3 pl-4 font-sans text-sm font-bold",
          className,
        )}
      >
        <span aria-hidden="true" className="text-muted-foreground whitespace-nowrap">
          {label}
        </span>
        <SelectPrimitive.Value className="text-foreground font-extrabold" />
        <SelectPrimitive.Icon>
          <ChevronDownIcon aria-hidden="true" className="size-4" strokeWidth={2.5} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner sideOffset={8} alignItemWithTrigger={false} className="z-50">
          <SelectPrimitive.Popup className="bg-card shadow-float min-w-(--anchor-width) rounded-2xl p-1.5 outline-none">
            <SelectPrimitive.List>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="data-highlighted:bg-muted flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2 font-sans text-sm font-bold outline-none data-selected:font-extrabold"
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <CheckIcon aria-hidden="true" className="text-primary size-4" strokeWidth={3} />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export { Select, type SelectOption };
