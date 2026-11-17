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

const COVER_COMBOS = [
  { bg: "bg-primary", ellipse1: "bg-signal", ellipse2: "bg-sky" },
  { bg: "bg-signal-soft", ellipse1: "bg-primary", ellipse2: "bg-sky" },
  { bg: "bg-sky", ellipse1: "bg-primary", ellipse2: "bg-signal-soft" },
] as const;

function idToComboIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash += id.charCodeAt(i);
  }
  return hash % COVER_COMBOS.length;
}

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

function formatEventTime(isoDate: string): string {
  return timeFormatter.format(new Date(isoDate));
}

function EventCard({ event, isFavorite, onToggleFavorite, className }: Readonly<EventCardProps>) {
  const cancelled = event.status === "cancelled";
  const combo = COVER_COMBOS[idToComboIndex(event.id)];

  return (
    <article
      data-slot="event-card"
      className={cn(
        "bg-card flex flex-col overflow-hidden border border-border rounded-[var(--radius-card)_var(--radius-card)_var(--radius-card)_var(--radius-anchor)]",
        className,
      )}
    >
      <div className={cn("relative h-[150px] overflow-hidden", combo.bg)}>
        <div
          className={cn(
            "absolute -top-12 -right-10 size-[170px] rounded-full opacity-80",
            combo.ellipse1,
          )}
        />
        <div
          className={cn(
            "absolute top-16 -left-8 size-[130px] rounded-full opacity-70",
            combo.ellipse2,
          )}
        />
        <DateBadge date={event.startDate} className="absolute top-3 left-3 z-10" />
        {onToggleFavorite ? (
          <FavoriteButton
            isFavorite={isFavorite ?? false}
            eventName={event.name}
            onToggle={onToggleFavorite}
            className="absolute top-2 right-2 z-10"
          />
        ) : null}
        <span className="absolute bottom-3 left-3 z-10 rounded-full bg-card/90 px-2.5 py-1 font-mono text-xs font-bold text-foreground backdrop-blur-sm">
          {formatEventTime(event.startDate)}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-display font-bold leading-tight">
          <Link to={`/events/${event.id}`} className="transition-colors hover:text-primary">
            {event.name}
          </Link>
        </h3>
        {event.location ? <p className="text-muted-foreground text-sm">{event.location}</p> : null}
        {cancelled ? <p className="text-signal-text text-sm font-bold">Annulé</p> : null}
        {!cancelled && event.capacity !== undefined && event.capacity !== null ? (
          <CapacityBar taken={event.ticketsSold ?? 0} capacity={event.capacity} />
        ) : null}
      </div>
    </article>
  );
}

export { EventCard, type EventCardEvent };
