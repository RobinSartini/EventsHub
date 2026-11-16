import { HeartIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  isFavorite: boolean;
  eventName: string;
  onToggle: () => void;
  size?: "default" | "lg";
  className?: string;
};

function FavoriteButton({
  isFavorite,
  eventName,
  onToggle,
  size = "default",
  className,
}: Readonly<FavoriteButtonProps>) {
  const action = isFavorite ? "Retirer" : "Ajouter";

  return (
    <button
      type="button"
      data-slot="favorite-button"
      data-size={size}
      aria-pressed={isFavorite}
      aria-label={`${action} ${eventName} ${isFavorite ? "des" : "aux"} favoris`}
      onClick={onToggle}
      className={cn(
        "bg-card text-signal-text inline-flex size-11 items-center justify-center rounded-full",
        className,
      )}
    >
      <HeartIcon
        aria-hidden="true"
        className="size-5"
        fill={isFavorite ? "currentColor" : "none"}
      />
    </button>
  );
}

export { FavoriteButton };
