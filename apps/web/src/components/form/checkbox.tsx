import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon } from "lucide-react";
import { type ReactNode, useId } from "react";

import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        focusRing,
        "border-input bg-card text-primary-foreground data-checked:bg-primary data-checked:border-primary aria-invalid:border-destructive flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 transition-colors duration-240 ease-signature disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator">
        <CheckIcon aria-hidden="true" className="size-3.5" strokeWidth={3.5} />
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
  const countId = useId();
  const hasCount = count !== undefined;

  return (
    <div data-slot="checkbox-field" className={cn("flex items-center gap-3", className)}>
      <label className="flex flex-1 cursor-pointer items-center gap-3 font-sans text-[15px] font-bold">
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value)}
          aria-describedby={hasCount ? countId : undefined}
        />
        {label}
      </label>
      {hasCount ? (
        <span id={countId} className="text-muted-foreground font-mono text-xs">
          {count}
        </span>
      ) : null}
    </div>
  );
}

type CheckboxGroupProps = {
  legend: string;
  children: ReactNode;
  className?: string;
};

function CheckboxGroup({ legend, children, className }: Readonly<CheckboxGroupProps>) {
  return (
    <fieldset data-slot="checkbox-group" className={cn("flex flex-col gap-3", className)}>
      <legend className="font-display mb-3 text-[15px] font-semibold">{legend}</legend>
      {children}
    </fieldset>
  );
}

export { Checkbox, CheckboxField, CheckboxGroup };
