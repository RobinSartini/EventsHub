import { useId } from "react";

import { cn } from "@/lib/utils";

// Composant réservé : API définitive, rendu final dans la PR 5 (#33).

type RangeSliderProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  /** Mise en forme de la valeur affichée et lue : 20 devient « 20 € ». */
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
      <div className="flex justify-between text-sm font-bold">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{format(value)}</output>
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
        className="accent-primary w-full"
      />
    </div>
  );
}

export { RangeSlider };
