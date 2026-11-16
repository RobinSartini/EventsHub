import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex size-4 items-center justify-center rounded-none border transition-colors group-has-disabled/field:opacity-50 focus-visible:ring-1 aria-invalid:ring-1 peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="[&>svg]:size-3.5 grid place-content-center text-current transition-none"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

type CheckboxFieldProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  count?: number;
  className?: string;
};

function CheckboxField({
  checked,
  onCheckedChange,
  label,
  count,
  className,
}: Readonly<CheckboxFieldProps>) {
  return (
    <label
      data-slot="checkbox-field"
      className={cn("flex cursor-pointer items-center gap-3 text-sm font-bold", className)}
    >
      <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value)} />
      <span className="flex-1">{label}</span>
      {count === undefined ? null : <span className="text-muted-foreground">{count}</span>}
    </label>
  );
}

type CheckboxGroupProps = {
  legend: string;
  children: ReactNode;
  className?: string;
};

function CheckboxGroup({ legend, children, className }: Readonly<CheckboxGroupProps>) {
  return (
    <fieldset data-slot="checkbox-group" className={cn("flex flex-col gap-2", className)}>
      <legend className="font-display mb-2 text-sm font-bold">{legend}</legend>
      {children}
    </fieldset>
  );
}

export { Checkbox, CheckboxField, CheckboxGroup };
