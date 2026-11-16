import { useId } from "react";

import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
};

function Switch({ checked, onCheckedChange, label, disabled, className }: Readonly<SwitchProps>) {
  const id = useId();

  return (
    <div data-slot="switch" className={cn("flex items-center gap-3", className)}>
      <label
        htmlFor={id}
        className="flex-1 cursor-pointer font-sans text-sm font-bold has-[+:disabled]:cursor-not-allowed"
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          focusRing,
          "group bg-muted-foreground aria-checked:bg-primary inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-240 ease-signature disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <span
          aria-hidden="true"
          className="bg-card size-5 rounded-full transition-transform duration-240 ease-signature group-aria-checked:translate-x-5 motion-reduce:transition-none"
        />
      </button>
    </div>
  );
}

export { Switch };
