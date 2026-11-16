import { Link } from "react-router";

import { cn } from "@/lib/utils";

import { CapacityBar } from "./capacity-bar";
import { DateBadge } from "./date-badge";
import { FavoriteButton } from "./favorite-button";

// Composant réservé : API définitive, rendu final dans la PR 4 (#33).

/** Champs de l'événement utilisés par la carte, repris du schéma Event du contrat d'API. */
type EventCardEvent = {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  location?: string;
  capacity?: number | null;
  status?: "published" | "cancelled";
  /** Billets vendus : pas encore dans le contrat, à confirmer avec le back. */
  ticketsSold?: number;
};

type EventCardProps = {
  event: EventCardEvent;
  /** Sans ces deux props, le cœur n'est pas affiché. */
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  className?: string;
};

function EventCard({ event, isFavorite, onToggleFavorite, className }: Readonly<EventCardProps>) {
  const cancelled = event.status === "cancelled";

  return (
    <article
      data-slot="event-card"
      className={cn("bg-card relative flex flex-col gap-2 rounded-card p-4", className)}
    >
      <DateBadge date={event.startDate} />
      <h3 className="font-display font-bold">
        <Link to={`/events/${event.id}`}>{event.name}</Link>
      </h3>
      {event.location ? <p className="text-muted-foreground text-sm">{event.location}</p> : null}
      {cancelled ? <p className="text-destructive font-bold">Annulé</p> : null}
      {!cancelled && event.capacity !== undefined ? (
        <CapacityBar taken={event.ticketsSold ?? 0} capacity={event.capacity} />
      ) : null}
      {onToggleFavorite ? (
        <FavoriteButton
          isFavorite={isFavorite ?? false}
          eventName={event.name}
          onToggle={onToggleFavorite}
          className="absolute top-3 right-3"
        />
      ) : null}
    </article>
  );
}

export { EventCard, type EventCardEvent };
