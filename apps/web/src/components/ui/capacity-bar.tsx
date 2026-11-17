import { cn } from "@/lib/utils";

type CapacityBarProps = {
  taken: number;
  capacity: number | null;
  className?: string;
};

function capacityLabel(taken: number, capacity: number): string {
  const remaining = capacity - taken;
  if (remaining <= 0) return "Complet";
  if (taken / capacity >= 0.7) return `Plus que ${remaining} place${remaining > 1 ? "s" : ""}`;
  return `${remaining} place${remaining > 1 ? "s" : ""} disponible${remaining > 1 ? "s" : ""}`;
}

function CapacityBar({ taken, capacity, className }: Readonly<CapacityBarProps>) {
  if (capacity === null) return null;

  const remaining = capacity - taken;
  const isCritical = remaining <= 0 || taken / capacity >= 0.7;

  return (
    <div data-slot="capacity-bar" className={cn("flex flex-col gap-1", className)}>
      <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
        <div
          role="progressbar"
          aria-valuenow={Math.min(taken, capacity)}
          aria-valuemin={0}
          aria-valuemax={capacity}
          aria-label="Places disponibles"
          style={{ width: `${Math.min((taken / capacity) * 100, 100)}%` }}
          className={cn(
            "h-full rounded-full transition-all",
            isCritical ? "bg-signal" : "bg-primary",
          )}
        />
      </div>
      <p
        className={cn(
          "text-xs font-bold",
          isCritical ? "text-signal-text" : "text-muted-foreground",
        )}
      >
        {capacityLabel(taken, capacity)}
      </p>
    </div>
  );
}

export { CapacityBar };
