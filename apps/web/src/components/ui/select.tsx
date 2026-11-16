import { useId } from "react";

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
  const id = useId();

  return (
    <div data-slot="select" className={cn("inline-flex items-center gap-2", className)}>
      <label htmlFor={id} className="text-muted-foreground text-sm">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value as T)}
        className="bg-card rounded-full px-4 py-2 text-sm font-bold"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export { Select, type SelectOption };
