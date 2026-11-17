import { Link } from "react-router";

import { formatEventDate } from "@/lib/format-date";
import { formatPrice } from "@/lib/format-price";
import { cn } from "@/lib/utils";

import { FavoriteButton } from "./favorite-button";

type EventCardEvent = {
  id: string;
  name: string;
  startDate: string;
  location?: string;
  status?: "published" | "cancelled";
  priceCents?: number;
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
  { media: "bg-signal", first: "bg-primary-soft", second: "bg-primary" },
  { media: "bg-primary-soft", first: "bg-primary", second: "bg-signal-soft" },
  { media: "bg-signal-soft", first: "bg-signal", second: "bg-primary" },
];

function mediaTheme(id: string) {
  let sum = 0;
  for (const char of id) sum += char.codePointAt(0) ?? 0;
  return MEDIA_THEMES[sum % MEDIA_THEMES.length];
}

const blob =
  "animate-morph absolute rounded-[42%_58%_63%_37%/41%_44%_56%_59%] motion-reduce:animate-none";
const meta = "text-muted-foreground text-sm";

function Price({ priceCents }: Readonly<{ priceCents: number }>) {
  return (
    <p className="text-sm">
      <span className="font-mono font-bold">{formatPrice(priceCents / 100)}</span>
      {priceCents > 0 ? <span className="text-muted-foreground"> par personne</span> : null}
    </p>
  );
}

function EventCard({ event, isFavorite, onToggleFavorite, className }: Readonly<EventCardProps>) {
  const theme = mediaTheme(event.id);

  return (
    <article
      data-slot="event-card"
      className={cn(
        "has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-background relative flex flex-col gap-3 rounded-media has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-offset-4",
        className,
      )}
    >
      <div className={cn("clip-media relative aspect-[20/19]", theme.media)}>
        <div
          aria-hidden="true"
          className={cn(blob, theme.first, "-top-[20%] -right-[25%] size-[85%]")}
        />
        <div
          aria-hidden="true"
          className={cn(
            blob,
            theme.second,
            "-bottom-[30%] -left-[20%] size-[70%] [animation-direction:reverse] [animation-duration:10s]",
          )}
        />
        {event.status === "cancelled" ? (
          <span className="bg-card text-signal-text absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-extrabold">
            Annulé
          </span>
        ) : null}
        {onToggleFavorite ? (
          <FavoriteButton
            isFavorite={isFavorite ?? false}
            eventName={event.name}
            onToggle={onToggleFavorite}
            className="absolute top-3 right-3 z-10"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base leading-snug font-bold">
          <Link
            to={`/events/${event.id}`}
            className="outline-none after:absolute after:inset-0 after:rounded-media"
          >
            {event.name}
          </Link>
        </h3>
        {event.location ? <p className={meta}>{event.location}</p> : null}
        <p className={meta}>{formatEventDate(event.startDate)}</p>
        {event.priceCents === undefined ? null : <Price priceCents={event.priceCents} />}
      </div>
    </article>
  );
}

export { EventCard, type EventCardEvent };
