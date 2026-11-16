import { cn } from "@/lib/utils";

type CapacityBarProps = {
  taken: number;
  capacity: number | null;
  className?: string;
};

function CapacityBar({ taken, capacity, className }: Readonly<CapacityBarProps>) {
  if (capacity === null) return null;

  return (
    <progress
      data-slot="capacity-bar"
      value={Math.min(taken, capacity)}
      max={capacity}
      className={cn("h-2 w-full", className)}
    />
  );
}

export { CapacityBar };
