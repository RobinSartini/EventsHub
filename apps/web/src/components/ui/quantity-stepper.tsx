import { MinusIcon, PlusIcon } from "lucide-react";

import { formatPrice } from "@/lib/format-price";
import { plural } from "@/lib/plural";
import { cn } from "@/lib/utils";

import { Button } from "./button";

type QuantityStepperProps = {
  label: string;
  price: number | null;
  value: number;
  min?: number;
  max: number;
  onValueChange: (value: number) => void;
  className?: string;
};

function QuantityStepper({
  label,
  price,
  value,
  min = 0,
  max,
  onValueChange,
  className,
}: Readonly<QuantityStepperProps>) {
  return (
    <div data-slot="quantity-stepper" className={cn("flex items-center gap-3", className)}>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-sans text-[15px] font-extrabold">{label}</span>
        <span className="text-muted-foreground font-mono text-sm font-bold">
          {formatPrice(price)}
        </span>
      </div>
      <Button
        variant="secondary"
        size="icon"
        aria-label={`Retirer un billet ${label}`}
        disabled={value <= min}
        onClick={() => onValueChange(value - 1)}
      >
        <MinusIcon aria-hidden="true" strokeWidth={3} />
      </Button>
      <span
        role="status"
        className="font-display min-w-[2ch] text-center text-lg font-extrabold tabular-nums"
      >
        {value}
        <span className="sr-only">{` ${plural(value, "billet")} ${label}`}</span>
      </span>
      <Button
        variant={value > 0 ? "default" : "secondary"}
        size="icon"
        aria-label={`Ajouter un billet ${label}`}
        disabled={value >= max}
        onClick={() => onValueChange(value + 1)}
      >
        <PlusIcon aria-hidden="true" strokeWidth={3} />
      </Button>
    </div>
  );
}

export { QuantityStepper };
