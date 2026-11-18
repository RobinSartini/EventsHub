import { Link } from "react-router";

import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

/** `inverted` : pour un fond de la couleur principale (panneau de marque), la tache passe en clair. */
function Logo({ className, inverted }: Readonly<{ className?: string; inverted?: boolean }>) {
  return (
    <Link
      to="/"
      data-slot="logo"
      className={cn(
        focusRing,
        "font-display flex items-center gap-2.5 rounded-full text-xl font-extrabold tracking-tight",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-8 place-items-center rounded-[55%_45%_50%_50%/50%_55%_45%_50%]",
          inverted ? "bg-primary-foreground" : "bg-primary",
        )}
      >
        <span className="bg-signal size-2.5 rounded-full" />
      </span>
      EventsHub
    </Link>
  );
}

export { Logo };
