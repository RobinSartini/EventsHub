import { HeartIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { IconButton } from "./icon-button";

type FavoriteButtonProps = {
  isFavorite: boolean;
  eventName: string;
  onToggle: () => void;
  isPending?: boolean;
  size?: "default" | "lg";
  className?: string;
};

function FavoriteButton({
  isFavorite,
  eventName,
  onToggle,
  isPending = false,
  size = "default",
  className,
}: Readonly<FavoriteButtonProps>) {
  const label = isFavorite
    ? `Retirer ${eventName} des favoris`
    : `Ajouter ${eventName} aux favoris`;

  return (
    <IconButton
      data-slot="favorite-button"
      size={size}
      aria-label={label}
      aria-pressed={isFavorite}
      aria-busy={isPending}
      onClick={() => {
        if (!isPending) onToggle();
      }}
      className={cn(
        "bg-card text-signal-text hover:bg-card active:scale-90",
        size === "lg" && "aria-pressed:bg-signal-soft aria-pressed:hover:bg-signal-soft",
        className,
      )}
    >
      <HeartIcon strokeWidth={2.2} className={cn("size-5", isFavorite && "fill-current")} />
    </IconButton>
  );
}

export { FavoriteButton };
