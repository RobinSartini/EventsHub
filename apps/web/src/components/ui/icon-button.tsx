import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

// Composant réservé : API définitive, rendu final dans la PR 4 (#33).

type IconButtonProps = Omit<ComponentProps<"button">, "aria-label"> & {
  /** Obligatoire : le bouton n'a pas de texte visible. */
  "aria-label": string;
  variant?: "default" | "outline" | "primary";
  size?: "default" | "lg";
};

function IconButton({
  variant = "default",
  size = "default",
  className,
  type = "button",
  ...props
}: Readonly<IconButtonProps>) {
  return (
    <button
      type={type}
      data-slot="icon-button"
      data-variant={variant}
      data-size={size}
      className={cn(
        "bg-secondary text-foreground inline-flex size-11 shrink-0 items-center justify-center rounded-full [&_svg]:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

export { IconButton };
