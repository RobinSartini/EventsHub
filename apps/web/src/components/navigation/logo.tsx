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
        "group/logo font-display flex items-center gap-2.5 rounded-full text-xl font-extrabold tracking-tight",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "ease-signature grid size-8 place-items-center rounded-[55%_45%_50%_50%/50%_55%_45%_50%] transition-transform duration-500 group-hover/logo:rotate-45",
          inverted ? "bg-primary-foreground" : "bg-primary",
        )}
      >
        <span className="bg-signal ease-signature size-2.5 rounded-full transition-transform duration-500 group-hover/logo:scale-125" />
      </span>
      EventsHub
    </Link>
  );
}

export { Logo };
