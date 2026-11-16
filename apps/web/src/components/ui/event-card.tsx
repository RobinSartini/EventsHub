import { Link } from "react-router";

import { formatTime } from "@/lib/format-date";
import { formatPrice } from "@/lib/format-price";
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
  price?: number | null;
};

type EventCardProps = {
  event: EventCardEvent;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  className?: string;
};

const MEDIA_THEMES = [
  { media: "bg-primary", first: "bg-signal", second: "bg-sky" },
  { media: "bg-sky", first: "bg-primary", second: "bg-signal" },
  { media: "bg-signal", first: "bg-sky", second: "bg-primary" },
];

function mediaTheme(id: string) {
  let sum = 0;
  for (const char of id) sum += char.codePointAt(0) ?? 0;
  return MEDIA_THEMES[sum % MEDIA_THEMES.length];
}

const blob =
  "animate-morph absolute rounded-[42%_58%_63%_37%/41%_44%_56%_59%] motion-reduce:animate-none";

function EventCard({ event, isFavorite, onToggleFavorite, className }: Readonly<EventCardProps>) {
  const theme = mediaTheme(event.id);
  const price =
    event.price === undefined ? null : (
      <span className="ml-auto font-mono text-sm font-bold whitespace-nowrap">
        {formatPrice(event.price)}
      </span>
    );
  const meta = [formatTime(event.startDate), event.location].filter(Boolean).join(" - ");

  return (
    <article
      data-slot="event-card"
      className={cn(
        "bg-card border-border has-[a:focus-visible]:ring-ring relative flex flex-col gap-3 rounded-card rounded-bl-anchor border p-2 has-[a:focus-visible]:ring-2",
        className,
      )}
    >
      <div
        className={cn("relative h-42 overflow-hidden rounded-[26px_26px_26px_6px]", theme.media)}
      >
        <div aria-hidden="true" className={cn(blob, theme.first, "-top-10 -right-12 size-45")} />
        <div
          aria-hidden="true"
          className={cn(
            blob,
            theme.second,
            "-bottom-15 -left-10 size-37.5 [animation-direction:reverse] [animation-duration:10s]",
          )}
        />
        <DateBadge date={event.startDate} className="absolute bottom-3 left-3" />
        {onToggleFavorite ? (
          <FavoriteButton
            isFavorite={isFavorite ?? false}
            eventName={event.name}
            onToggle={onToggleFavorite}
            className="absolute top-2 right-2 z-10"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-2 px-2.5 pb-2.5">
        <h3 className="font-display text-[17px] leading-tight font-semibold tracking-tight">
          <Link
            to={`/events/${event.id}`}
            className="outline-none after:absolute after:inset-0 after:rounded-[inherit]"
          >
            {event.name}
          </Link>
        </h3>
        <span className="text-muted-foreground text-sm font-semibold">{meta}</span>
        {event.status !== "cancelled" && event.capacity != null ? (
          <CapacityBar taken={event.ticketsSold ?? 0} capacity={event.capacity}>
            {price}
          </CapacityBar>
        ) : (
          <div className="flex items-baseline gap-2">
            {event.status === "cancelled" ? (
              <span className="text-signal-text text-[13px] font-extrabold">Annulé</span>
            ) : null}
            {price}
          </div>
        )}
      </div>
    </article>
  );
}

export { EventCard, type EventCardEvent };
