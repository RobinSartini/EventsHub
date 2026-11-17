import { Link } from "react-router";

import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

function Logo({ className }: Readonly<{ className?: string }>) {
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
        className="bg-primary grid size-8 place-items-center rounded-[55%_45%_50%_50%/50%_55%_45%_50%]"
      >
        <span className="bg-signal size-2.5 rounded-full" />
      </span>
      EventsHub
    </Link>
  );
}

export { Logo };
