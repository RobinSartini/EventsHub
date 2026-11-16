import { Link } from "react-router";

import { cn } from "@/lib/utils";

import { CapacityBar } from "./capacity-bar";
import { DateBadge } from "./date-badge";
import { FavoriteButton } from "./favorite-button";

type EventCardEvent = {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  location?: string;
  capacity?: number | null;
  status?: "published" | "cancelled";
  ticketsSold?: number;
};

type EventCardProps = {
  event: EventCardEvent;
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
