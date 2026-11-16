import { useId } from "react";

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
    <div data-slot="switch" className={cn("inline-flex items-center gap-3", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className="bg-secondary aria-checked:bg-primary h-6 w-11 rounded-full"
      />
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
    </div>
  );
}

export { Switch };
