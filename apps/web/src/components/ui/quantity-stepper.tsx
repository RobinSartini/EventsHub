import { cn } from "@/lib/utils";

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
    <div data-slot="quantity-stepper" className={cn("flex items-center gap-4", className)}>
      <div className="flex-1">
        <p className="font-bold">{label}</p>
        <p className="text-muted-foreground text-sm">{price === null ? "Gratuit" : `${price} €`}</p>
      </div>
      <button
        type="button"
        aria-label={`Retirer un billet ${label}`}
        disabled={value <= min}
        onClick={() => onValueChange(value - 1)}
        className="bg-secondary size-9 rounded-full"
      >
        -
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        aria-label={`Ajouter un billet ${label}`}
        disabled={value >= max}
        onClick={() => onValueChange(value + 1)}
        className="bg-secondary size-9 rounded-full"
      >
        +
      </button>
    </div>
  );
}

export { QuantityStepper };
