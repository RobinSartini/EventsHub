import { cn } from "@/lib/utils";

// Composant réservé : API définitive, rendu final dans la PR 3 (#33).

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  /** Nom du groupe pour les lecteurs d'écran, par exemple « Affichage ». */
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

/** Une seule option active à la fois : sur Explorer, Liste OU Carte. */
function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onValueChange,
  className,
}: Readonly<SegmentedControlProps<T>>) {
  return (
    <div
      role="group"
      aria-label={label}
      data-slot="segmented-control"
      className={cn("bg-secondary inline-flex rounded-full p-1", className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onValueChange(option.value)}
          className="aria-pressed:bg-card rounded-full px-3.5 py-1.5 text-sm font-bold"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export { SegmentedControl, type SegmentedOption };
