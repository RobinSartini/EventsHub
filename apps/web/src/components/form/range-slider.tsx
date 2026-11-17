import { useId } from "react";

import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

type RangeSliderProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  format?: (value: number) => string;
  className?: string;
};

function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onValueChange,
  format = String,
  className,
}: Readonly<RangeSliderProps>) {
  const id = useId();

  return (
    <div data-slot="range-slider" className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-muted-foreground text-sm font-semibold">
          {label}
        </label>
        <output htmlFor={id} className="text-primary font-mono text-sm font-bold">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={format(value)}
        onChange={(event) => onValueChange(Number(event.target.value))}
        className={cn(focusRing, "accent-primary w-full cursor-pointer rounded-full")}
      />
    </div>
  );
}

export { RangeSlider };
