import { cn } from "@/lib/utils";

// Composant réservé : API définitive, rendu final dans la PR 4 (#33).
// Le texte (« 26 places disponibles », « Plus que 18 places », « Complet ») arrive en TDD.

type CapacityBarProps = {
  /** Billets déjà vendus. */
  taken: number;
  /** Capacité de l'événement, null quand elle n'est pas limitée. */
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
