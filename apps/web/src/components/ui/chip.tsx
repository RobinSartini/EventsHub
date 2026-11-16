import { XIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

const chipBase =
  "inline-flex items-center gap-1.5 rounded-full font-sans text-sm whitespace-nowrap transition-colors duration-240 ease-signature";

type ChipProps = Omit<ComponentProps<"button">, "onClick"> & {
  selected: boolean;
  onSelectedChange?: (selected: boolean) => void;
};

function Chip({ selected, onSelectedChange, className, ...props }: Readonly<ChipProps>) {
  return (
    <button
      type="button"
      data-slot="chip"
      aria-pressed={selected}
      onClick={() => onSelectedChange?.(!selected)}
      className={cn(
        chipBase,
        focusRing,
        "border-border text-foreground cursor-pointer border-2 bg-transparent px-4 py-2 font-bold",
        "aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:border-foreground aria-pressed:font-extrabold",
        className,
      )}
      {...props}
    />
  );
}

type SoftChipProps = {
  children: ReactNode;
  className?: string;
};

function SoftChip({ children, className }: Readonly<SoftChipProps>) {
  return (
    <span
      data-slot="soft-chip"
      className={cn(chipBase, "bg-sky text-foreground px-4 py-2 font-bold", className)}
    >
      {children}
    </span>
  );
}

type RemovableChipProps = {
  label: string;
  onRemove: () => void;
  className?: string;
};

function RemovableChip({ label, onRemove, className }: Readonly<RemovableChipProps>) {
  return (
    <button
      type="button"
      data-slot="removable-chip"
      aria-label={`Retirer le filtre ${label}`}
      onClick={onRemove}
      className={cn(
        chipBase,
        focusRing,
        "bg-primary-soft text-foreground h-9 cursor-pointer pr-2.5 pl-3.5 font-extrabold",
        className,
      )}
    >
      {label}
      <XIcon aria-hidden="true" className="size-3.5" strokeWidth={3} />
    </button>
  );
}

export { Chip, RemovableChip, SoftChip };
