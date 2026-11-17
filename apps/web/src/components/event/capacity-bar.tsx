import type { ReactNode } from "react";

import { capacityStatus } from "@/lib/capacity";
import { cn } from "@/lib/utils";

type CapacityBarProps = {
  taken: number;
  capacity: number | null;
  className?: string;
  children?: ReactNode;
};

function CapacityBar({ taken, capacity, className, children }: Readonly<CapacityBarProps>) {
  if (capacity === null) return null;

  const { level, hint } = capacityStatus(taken, capacity);
  const filled = Math.min(taken, capacity);
  const isAlert = level !== "calm";

  return (
    <div data-slot="capacity-bar" className={cn("flex flex-col gap-2", className)}>
      <div
        role="progressbar"
        aria-label="Places réservées"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={filled}
        aria-valuetext={hint}
        className="bg-secondary h-1.5 overflow-hidden rounded-full"
      >
        <div
          className={cn(
            "h-full transition-[width] duration-700 ease-signature motion-reduce:transition-none",
            isAlert ? "bg-signal" : "bg-primary",
          )}
          style={{ width: `${(filled / capacity) * 100}%` }}
        />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span
          aria-hidden="true"
          className={cn(
            "font-sans text-[13px] font-extrabold",
            isAlert ? "text-signal-text" : "text-muted-foreground",
          )}
        >
          {hint}
        </span>
        {children}
      </div>
    </div>
  );
}

export { CapacityBar };
